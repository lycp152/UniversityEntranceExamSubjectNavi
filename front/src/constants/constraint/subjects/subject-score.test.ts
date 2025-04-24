/**
 * 科目スコアの制約のテスト
 * 型定義と制約値の検証を行います
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { SUBJECT_SCORE_CONSTRAINTS, Score, Percentage, DecimalPlaces } from './subject-score';

describe('科目スコアの制約', () => {
  beforeAll(() => {
    // テスト開始前の前処理
    console.log('科目スコアの制約テストを開始します');
  });

  afterAll(() => {
    // テスト終了後の後処理
    console.log('科目スコアの制約テストを終了します');
  });

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

    it('スコアのエッジケースが正しく処理されること', () => {
      const minScore = SUBJECT_SCORE_CONSTRAINTS.MIN_SCORE as Score;
      const maxScore = SUBJECT_SCORE_CONSTRAINTS.MAX_SCORE as Score;
      expect(minScore).toBe(0);
      expect(maxScore).toBe(1000);
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

    it('パーセンテージのエッジケースが正しく処理されること', () => {
      const minPercentage = SUBJECT_SCORE_CONSTRAINTS.MIN_PERCENTAGE as Percentage;
      const maxPercentage = SUBJECT_SCORE_CONSTRAINTS.MAX_PERCENTAGE as Percentage;
      expect(minPercentage).toBe(0);
      expect(maxPercentage).toBe(100);
    });
  });

  describe('科目名の制約', () => {
    it('科目名の最大長が正しいこと', () => {
      expect(SUBJECT_SCORE_CONSTRAINTS.MAX_SUBJECT_NAME_LENGTH).toBe(20);
    });

    it('科目名が空でないことが制約されていること', () => {
      expect(SUBJECT_SCORE_CONSTRAINTS.SUBJECT_NAME_NOT_EMPTY).toBe(true);
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

    it('小数点以下の桁数が正しく丸められること', () => {
      const value = 123.456;
      const roundedValue = Number(value.toFixed(SUBJECT_SCORE_CONSTRAINTS.DEFAULT_DECIMAL_PLACES));
      expect(roundedValue).toBe(123.46);
    });
  });
});
