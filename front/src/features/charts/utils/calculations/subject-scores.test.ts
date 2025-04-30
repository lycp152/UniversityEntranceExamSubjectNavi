/**
 * 科目スコアの計算処理のテスト
 * 科目スコアの合計やカテゴリ別の合計の計算を検証
 *
 * @module subject-scores.test
 * @description
 * - 全科目の合計スコア計算のテスト
 * - カテゴリ別の合計スコア計算のテスト
 * - 共通テストと二次試験の合計計算のテスト
 */

import { describe, it, expect } from 'vitest';
import {
  calculateTotalScore,
  calculateCategoryTotal,
  calculateTotalScores,
} from './subject-scores';
import { SubjectScores } from '@/types/score';

describe('科目スコアの計算処理', () => {
  const mockSubjects: SubjectScores = {
    数学: { commonTest: 100, secondTest: 200 },
    英語: { commonTest: 150, secondTest: 100 },
    国語: { commonTest: 120, secondTest: 180 },
  };

  describe('calculateTotalScore', () => {
    it('全科目の合計スコアを正しく計算する', () => {
      const result = calculateTotalScore(mockSubjects);
      expect(result).toBe(850); // 100+200 + 150+100 + 120+180 = 850
    });

    it('空の科目スコアの場合、0を返す', () => {
      const result = calculateTotalScore({});
      expect(result).toBe(0);
    });
  });

  describe('calculateCategoryTotal', () => {
    it('指定されたカテゴリの合計スコアを正しく計算する', () => {
      const result = calculateCategoryTotal(mockSubjects, '数学');
      expect(result).toBe(300); // 100+200 = 300
    });

    it('存在しないカテゴリの場合、0を返す', () => {
      const result = calculateCategoryTotal(mockSubjects, '存在しない科目');
      expect(result).toBe(0);
    });
  });

  describe('calculateTotalScores', () => {
    it('共通テスト、二次試験、総合の合計点を正しく計算する', () => {
      const result = calculateTotalScores(mockSubjects);
      expect(result).toEqual({
        commonTest: 370, // 100+150+120 = 370
        secondTest: 480, // 200+100+180 = 480
        total: 850, // 370+480 = 850
      });
    });

    it('空の科目スコアの場合、すべて0を返す', () => {
      const result = calculateTotalScores({});
      expect(result).toEqual({
        commonTest: 0,
        secondTest: 0,
        total: 0,
      });
    });
  });
});
