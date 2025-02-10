import { describe, beforeEach, it, expect, vi } from 'vitest';
import { ScoreValidator } from '../scoreValidator';
import { TEST_TYPES } from '@/lib/types/score';
import { ScoreErrorCodes } from '@/lib/errors/score';
import type { BaseSubjectScore } from '@/lib/types/score';

describe('scoreValidator', () => {
  let validator: ScoreValidator;
  let mockErrorLogger: ReturnType<typeof vi.fn>;

  const validScore: BaseSubjectScore = {
    [TEST_TYPES.COMMON]: { value: 80, maxValue: 100 },
    [TEST_TYPES.INDIVIDUAL]: { value: 150, maxValue: 200 },
  };

  const invalidScore: BaseSubjectScore = {
    [TEST_TYPES.COMMON]: { value: -10, maxValue: 100 },
    [TEST_TYPES.INDIVIDUAL]: { value: -20, maxValue: 100 },
  };

  // 境界値テスト用のスコア
  const boundaryScores = {
    minimum: {
      [TEST_TYPES.COMMON]: { value: 0, maxValue: 100 },
      [TEST_TYPES.INDIVIDUAL]: { value: 0, maxValue: 100 },
    },
    nearBoundary: {
      [TEST_TYPES.COMMON]: { value: 1, maxValue: 100 },
      [TEST_TYPES.INDIVIDUAL]: { value: 1, maxValue: 100 },
    },
  } as const;

  beforeEach(() => {
    mockErrorLogger = vi.fn();
    validator = new ScoreValidator(undefined, mockErrorLogger);
  });

  describe('validateScore', () => {
    it('有効なスコアを正しく検証する', async () => {
      const result = await validator.validateScore(validScore);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('無効なスコアを正しく検証する', async () => {
      const result = await validator.validateScore(invalidScore);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.errors[0].code).toBe(ScoreErrorCodes.INVALID_SCORE);
    });

    it('バリデーション結果をキャッシュする', async () => {
      const firstResult = await validator.validateScore(validScore);
      const secondResult = await validator.validateScore(validScore);

      // タイムスタンプを除外して比較
      const { metadata: firstMetadata, ...firstResultWithoutMetadata } = firstResult;
      const { metadata: secondMetadata, ...secondResultWithoutMetadata } = secondResult;

      expect(firstResultWithoutMetadata).toEqual(secondResultWithoutMetadata);
      expect(firstResult.isValid).toBe(secondResult.isValid);
      expect(firstResult.errors).toEqual(secondResult.errors);
    });

    // 境界値のテストを追加
    it.each([
      ['最小値', boundaryScores.minimum],
      ['境界値付近', boundaryScores.nearBoundary],
    ])('%sのスコアを正しく検証する', async (_, score) => {
      const result = await validator.validateScore(score);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    // エッジケースのテスト
    it('未定義のプロパティを含むスコアを検証する', async () => {
      const incompleteScore = {
        [TEST_TYPES.COMMON]: { value: 80, maxValue: 100 },
      } as BaseSubjectScore;
      const result = await validator.validateScore(incompleteScore);
      expect(result.isValid).toBe(false);
    });
  });

  describe('isValidScore', () => {
    it('有効なスコアを正しく判定する', () => {
      expect(validator.isValidScore(validScore)).toBe(true);
    });

    it('無効なスコアを正しく判定する', () => {
      expect(validator.isValidScore(invalidScore)).toBe(false);
      expect(mockErrorLogger).toHaveBeenCalled();
    });

    it('エラー発生時にfalseを返す', () => {
      const invalidInput = null as unknown as BaseSubjectScore;
      expect(validator.isValidScore(invalidInput)).toBe(false);
      expect(mockErrorLogger).toHaveBeenCalled();
    });

    // 境界値のテストを追加
    it.each([
      ['最小値', boundaryScores.minimum],
      ['境界値付近', boundaryScores.nearBoundary],
    ])('%sのスコアを正しく判定する', (_, score) => {
      expect(validator.isValidScore(score)).toBe(true);
    });
  });

  describe('calculateTotal', () => {
    it('有効なスコアの合計を正しく計算する', () => {
      const total = validator.calculateTotal(validScore);
      expect(total).toBe(230); // 80 + 150
    });

    it('無効なスコアの場合は0を返す', () => {
      const total = validator.calculateTotal(invalidScore);
      expect(total).toBe(0);
    });

    it('計算結果をキャッシュする', () => {
      const firstTotal = validator.calculateTotal(validScore);
      const secondTotal = validator.calculateTotal(validScore);
      expect(firstTotal).toBe(secondTotal);
    });

    // 境界値のテストを追加
    it.each([
      ['最小値', boundaryScores.minimum, 0],
      ['境界値付近', boundaryScores.nearBoundary, 2],
    ])('%sのスコアの合計を正しく計算する', (_, score, expected) => {
      expect(validator.calculateTotal(score)).toBe(expected);
    });
  });

  describe('clearCache', () => {
    it('特定のスコアのキャッシュをクリアする', () => {
      validator.calculateTotal(validScore);
      validator.clearCache(validScore);
      const newTotal = validator.calculateTotal(validScore);
      expect(newTotal).toBe(230);
    });

    it('全てのキャッシュをクリアする', () => {
      validator.calculateTotal(validScore);
      validator.clearCache();
      const newTotal = validator.calculateTotal(validScore);
      expect(newTotal).toBe(230);
    });

    it('エラー発生時にエラーをログに記録する', () => {
      const invalidInput = null as unknown as BaseSubjectScore;
      validator.clearCache(invalidInput);
      expect(mockErrorLogger).toHaveBeenCalled();
    });

    it('キャッシュクリア後に再計算が行われることを確認する', () => {
      const spy = vi.spyOn(validator as any, 'isValidTestScore');
      validator.calculateTotal(validScore);
      validator.clearCache(validScore);
      validator.calculateTotal(validScore);
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });
  });
});
