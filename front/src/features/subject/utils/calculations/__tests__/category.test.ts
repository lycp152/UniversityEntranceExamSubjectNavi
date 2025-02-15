import { SubjectScores } from '@/lib/types';
import { calculateCategoryTotal } from '../category';
import { testData } from './testData';

describe('category calculations', () => {
  describe('calculateCategoryTotal', () => {
    it.each([
      ['英語', undefined, testData.categories.english.total],
      ['英語', 'commonTest', testData.categories.english.commonTest],
      ['英語', 'secondTest', testData.categories.english.secondTest],
    ])(
      'カテゴリー: %s, テスト種別: %s の合計点を正しく計算する',
      (category, testType, expected) => {
        const result = calculateCategoryTotal(
          testData.subjects,
          category,
          testType as 'commonTest' | 'secondTest' | undefined
        );
        expect(result).toBe(expected);
      }
    );

    it.each([
      ['存在しない', undefined],
      ['存在しない', 'commonTest'],
      ['存在しない', 'secondTest'],
    ])('存在しないカテゴリー %s（テスト種別: %s）の場合は0を返す', (category, testType) => {
      const result = calculateCategoryTotal(
        testData.subjects,
        category,
        testType as 'commonTest' | 'secondTest' | undefined
      );
      expect(result).toBe(0);
    });

    it('空のオブジェクトの場合は0を返す', () => {
      const result = calculateCategoryTotal({} as SubjectScores, '英語');
      expect(result).toBe(0);
    });
  });
});
