/**
 * 科目スコアの制約のテスト
 * 型定義と制約値の検証を行います
 */

import { describe, it, expect } from 'vitest';
import {
  SUBJECT_SCORE_CONSTRAINTS,
  Score,
  Percentage,
  DecimalPlaces,
  CalculationConstraint,
} from './subject-score';

describe('科目スコアの制約', () => {
  describe('スコアの制約', () => {
    it('スコアの最小値が正しいこと', () => {
      expect(SUBJECT_SCORE_CONSTRAINTS.MIN_SCORE).toBe(0);
    });

    it('スコアの最大値が正しいこと', () => {
      expect(SUBJECT_SCORE_CONSTRAINTS.MAX_SCORE).toBe(1000);
    });

    it('スコアの型が正しいこと', () => {
      const validScore = 500 as Score;
      expect(validScore).toBe(500);
    });
  });

  describe('パーセンテージの制約', () => {
    it('パーセンテージの最小値が正しいこと', () => {
      expect(SUBJECT_SCORE_CONSTRAINTS.MIN_PERCENTAGE).toBe(0);
    });

    it('パーセンテージの最大値が正しいこと', () => {
      expect(SUBJECT_SCORE_CONSTRAINTS.MAX_PERCENTAGE).toBe(100);
    });

    it('パーセンテージの型が正しいこと', () => {
      const validPercentage = 50 as Percentage;
      expect(validPercentage).toBe(50);
    });
  });

  describe('科目名の制約', () => {
    it('科目名の最大長が正しいこと', () => {
      expect(SUBJECT_SCORE_CONSTRAINTS.MAX_SUBJECT_NAME_LENGTH).toBe(20);
    });
  });

  describe('小数点以下の桁数', () => {
    it('デフォルトの小数点以下の桁数が正しいこと', () => {
      expect(SUBJECT_SCORE_CONSTRAINTS.DEFAULT_DECIMAL_PLACES).toBe(2);
    });

    it('小数点以下の桁数の型が正しいこと', () => {
      const validDecimalPlaces: DecimalPlaces = 2;
      expect(validDecimalPlaces).toBe(2);
    });
  });

  describe('計算制約', () => {
    it('計算制約の定義が正しいこと', () => {
      expect(SUBJECT_SCORE_CONSTRAINTS.CALCULATION_CONSTRAINTS).toEqual({
        MIN_TOTAL_SCORE: 0,
        MAX_TOTAL_SCORE: 1000,
        MIN_TOTAL_PERCENTAGE: 0,
        MAX_TOTAL_PERCENTAGE: 100,
        MAX_DECIMAL_PLACES: 2,
      });
    });

    it('計算制約の型が正しいこと', () => {
      const constraints: CalculationConstraint = SUBJECT_SCORE_CONSTRAINTS.CALCULATION_CONSTRAINTS;
      expect(constraints.MIN_TOTAL_SCORE).toBe(0);
      expect(constraints.MAX_TOTAL_SCORE).toBe(1000);
      expect(constraints.MIN_TOTAL_PERCENTAGE).toBe(0);
      expect(constraints.MAX_TOTAL_PERCENTAGE).toBe(100);
      expect(constraints.MAX_DECIMAL_PLACES).toBe(2);
    });
  });
});
