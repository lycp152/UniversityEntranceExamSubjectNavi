import {
  calculateTotalScore,
  calculateCategoryTotal,
  calculatePercentage,
  calculateSubjectScores,
  calculateTestTypeTotal,
} from '@/utils/subject/score/calculations';
import { SubjectScores } from '@/lib/types/models';

describe('scoreCalculations', () => {
  const mockSubjects = {
    英語R: { commonTest: 100, secondTest: 200 },
    英語L: { commonTest: 50, secondTest: 150 },
    数学: { commonTest: 200, secondTest: 300 },
    国語: { commonTest: 0, secondTest: 0 },
    理科: { commonTest: 0, secondTest: 0 },
    地歴公: { commonTest: 0, secondTest: 0 },
  } as SubjectScores;

  describe('calculateTotalScore', () => {
    it('全科目の合計点を正しく計算する', () => {
      const result = calculateTotalScore(mockSubjects);
      expect(result).toBe(1000); // (100 + 200) + (50 + 150) + (200 + 300)
    });

    it('空のオブジェクトの場合は0を返す', () => {
      const result = calculateTotalScore({} as SubjectScores);
      expect(result).toBe(0);
    });
  });

  describe('calculateCategoryTotal', () => {
    it('特定のカテゴリーの合計点を正しく計算する', () => {
      const result = calculateCategoryTotal(mockSubjects, '英語');
      expect(result).toBe(500); // (100 + 200) + (50 + 150)
    });

    it('存在しないカテゴリーの場合は0を返す', () => {
      const result = calculateCategoryTotal(mockSubjects, '存在しない');
      expect(result).toBe(0);
    });
  });

  describe('calculateTestTypeTotal', () => {
    it('共通テストの合計点を正しく計算する', () => {
      const result = calculateTestTypeTotal(mockSubjects, 'commonTest');
      expect(result).toBe(350); // 100 + 50 + 200
    });

    it('二次試験の合計点を正しく計算する', () => {
      const result = calculateTestTypeTotal(mockSubjects, 'secondTest');
      expect(result).toBe(650); // 200 + 150 + 300
    });
  });

  describe('calculatePercentage', () => {
    it('パーセンテージを正しく計算する', () => {
      const result = calculatePercentage(25, 100);
      expect(result).toBe(25);
    });

    it('合計が0の場合は0を返す', () => {
      const result = calculatePercentage(25, 0);
      expect(result).toBe(0);
    });
  });

  describe('calculateSubjectScores', () => {
    it('科目ごとのスコアを正しく計算する', () => {
      const result = calculateSubjectScores(mockSubjects);
      const totalScore = 1000;

      expect(result).toHaveLength(6);
      expect(result[0]).toEqual({
        subject: '英語R',
        commonTest: {
          score: 100,
          percentage: (100 / totalScore) * 100,
        },
        secondaryTest: {
          score: 200,
          percentage: (200 / totalScore) * 100,
        },
        total: {
          score: 300,
          percentage: (300 / totalScore) * 100,
        },
      });
    });

    it('空のオブジェクトの場合は空の配列を返す', () => {
      const result = calculateSubjectScores({} as SubjectScores);
      expect(result).toEqual([]);
    });
  });
});
