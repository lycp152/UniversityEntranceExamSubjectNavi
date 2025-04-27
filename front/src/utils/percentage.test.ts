/**
 * パーセンテージ計算のテスト
 * スコアからパーセンテージを計算する関数のテスト
 *
 * @module percentage-test
 * @description
 * - 通常のパーセンテージ計算のテスト
 * - 重み付けパーセンテージ計算のテスト
 * - バリデーション関数のテスト
 */

import { describe, it, expect } from 'vitest';
import {
  calculatePercentage,
  validatePercentage,
  validateScore,
  calculateWeightedPercentage,
} from './percentage';

describe('パーセンテージ計算のテスト', () => {
  describe('通常のパーセンテージ計算', () => {
    it('正しいパーセンテージを計算すること', () => {
      expect(calculatePercentage(75, 100)).toBe(75.0);
      expect(calculatePercentage(50, 200)).toBe(25.0);
    });

    it('合計が0の場合、0を返すこと', () => {
      expect(calculatePercentage(75, 0)).toBe(0);
    });

    it('小数点以下の桁数が正しいこと', () => {
      expect(calculatePercentage(33.333, 100)).toBe(33.33);
    });
  });

  describe('パーセンテージのバリデーション', () => {
    it('有効なパーセンテージを検証すること', () => {
      expect(validatePercentage(0)).toBe(true);
      expect(validatePercentage(50)).toBe(true);
      expect(validatePercentage(100)).toBe(true);
    });

    it('無効なパーセンテージを検証すること', () => {
      expect(validatePercentage(-1)).toBe(false);
      expect(validatePercentage(101)).toBe(false);
    });
  });

  describe('スコアのバリデーション', () => {
    it('有効なスコアを検証すること', () => {
      expect(validateScore(0)).toBe(true);
      expect(validateScore(50)).toBe(true);
      expect(validateScore(100)).toBe(true);
      expect(validateScore(1000)).toBe(true);
    });

    it('無効なスコアを検証すること', () => {
      expect(validateScore(-1)).toBe(false);
      expect(validateScore(1001)).toBe(false);
    });
  });

  describe('重み付けパーセンテージ計算', () => {
    it('正しい重み付けパーセンテージを計算すること', () => {
      expect(calculateWeightedPercentage(80, 100, 0.5)).toBe(40.0);
      expect(calculateWeightedPercentage(60, 100, 0.75)).toBe(45.0);
    });

    it('最大値が0の場合、0を返すこと', () => {
      expect(calculateWeightedPercentage(80, 0, 0.5)).toBe(0);
    });

    it('小数点以下の桁数が正しいこと', () => {
      expect(calculateWeightedPercentage(33.333, 100, 0.5)).toBe(16.67);
    });
  });
});
