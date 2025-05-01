import { describe, expect, it } from 'vitest';
import {
  isCommonSubject,
  isSecondarySubject,
  getSubjectBaseCategory,
  compareSubjectOrder,
} from './subject-type-validator';
import { EXAM_TYPES } from '@/constants/constraint/exam-types';
import { SUBJECT_CATEGORIES } from '@/constants/constraint/subjects/subject-categories';

/**
 * 科目タイプバリデーションのテスト
 * 各関数の動作を検証する
 */
describe('科目タイプバリデーション', () => {
  /**
   * 共通科目の判定テスト
   * 共通科目かどうかを判定する関数の動作を検証
   */
  describe('isCommonSubject', () => {
    it('共通科目の場合、trueを返す - 正常系', () => {
      const result = isCommonSubject(EXAM_TYPES.COMMON.name);
      expect(result).toBe(true);
    });

    it('共通科目でない場合、falseを返す - 異常系', () => {
      const result = isCommonSubject(EXAM_TYPES.SECONDARY.name);
      expect(result).toBe(false);
    });

    it('科目名が空の場合、エラーを返す - エラーケース', () => {
      expect(() => isCommonSubject('')).toThrow();
    });

    it('科目名がnullの場合、エラーを返す - エラーケース', () => {
      expect(() => isCommonSubject(null as unknown as string)).toThrow();
    });

    it('科目名がundefinedの場合、エラーを返す - エラーケース', () => {
      expect(() => isCommonSubject(undefined as unknown as string)).toThrow();
    });
  });

  /**
   * 二次科目の判定テスト
   * 二次科目かどうかを判定する関数の動作を検証
   */
  describe('isSecondarySubject', () => {
    it('二次科目の場合、trueを返す - 正常系', () => {
      const result = isSecondarySubject(EXAM_TYPES.SECONDARY.name);
      expect(result).toBe(true);
    });

    it('二次科目でない場合、falseを返す - 異常系', () => {
      const result = isSecondarySubject(EXAM_TYPES.COMMON.name);
      expect(result).toBe(false);
    });

    it('科目名が空の場合、エラーを返す - エラーケース', () => {
      expect(() => isSecondarySubject('')).toThrow();
    });

    it('科目名がnullの場合、エラーを返す - エラーケース', () => {
      expect(() => isSecondarySubject(null as unknown as string)).toThrow();
    });

    it('科目名がundefinedの場合、エラーを返す - エラーケース', () => {
      expect(() => isSecondarySubject(undefined as unknown as string)).toThrow();
    });
  });

  /**
   * 科目カテゴリの取得テスト
   * 科目名から基本カテゴリを取得する関数の動作を検証
   */
  describe('getSubjectBaseCategory', () => {
    it('英語科目の場合、英語カテゴリを返す - 正常系', () => {
      const result = getSubjectBaseCategory(SUBJECT_CATEGORIES.ENGLISH.category);
      expect(result).toBe(SUBJECT_CATEGORIES.ENGLISH.category);
    });

    it('数学科目の場合、数学カテゴリを返す - 正常系', () => {
      const result = getSubjectBaseCategory(SUBJECT_CATEGORIES.MATH.category);
      expect(result).toBe(SUBJECT_CATEGORIES.MATH.category);
    });

    it('科目名が空の場合、エラーを返す - エラーケース', () => {
      expect(() => getSubjectBaseCategory('')).toThrow();
    });

    it('科目名がnullの場合、エラーを返す - エラーケース', () => {
      expect(() => getSubjectBaseCategory(null as unknown as string)).toThrow();
    });

    it('科目名がundefinedの場合、エラーを返す - エラーケース', () => {
      expect(() => getSubjectBaseCategory(undefined as unknown as string)).toThrow();
    });

    it('未知の科目の場合、英語カテゴリを返す - 異常系', () => {
      const result = getSubjectBaseCategory('未知の科目');
      expect(result).toBe(SUBJECT_CATEGORIES.ENGLISH.category);
    });
  });

  /**
   * 科目の表示順比較テスト
   * 科目の表示順を比較する関数の動作を検証
   */
  describe('compareSubjectOrder', () => {
    it('英語と数学を比較した場合、英語が先になる - 正常系', () => {
      const result = compareSubjectOrder(
        SUBJECT_CATEGORIES.ENGLISH.category,
        SUBJECT_CATEGORIES.MATH.category
      );
      expect(result).toBeLessThan(0);
    });

    it('数学と英語を比較した場合、数学が後になる - 正常系', () => {
      const result = compareSubjectOrder(
        SUBJECT_CATEGORIES.MATH.category,
        SUBJECT_CATEGORIES.ENGLISH.category
      );
      expect(result).toBeGreaterThan(0);
    });

    it('同じ科目を比較した場合、0を返す - 正常系', () => {
      const result = compareSubjectOrder(
        SUBJECT_CATEGORIES.ENGLISH.category,
        SUBJECT_CATEGORIES.ENGLISH.category
      );
      expect(result).toBe(0);
    });

    it('科目名が空の場合、エラーを返す - エラーケース', () => {
      expect(() => compareSubjectOrder('', SUBJECT_CATEGORIES.ENGLISH.category)).toThrow();
      expect(() => compareSubjectOrder(SUBJECT_CATEGORIES.ENGLISH.category, '')).toThrow();
    });

    it('科目名がnullの場合、エラーを返す - エラーケース', () => {
      expect(() =>
        compareSubjectOrder(null as unknown as string, SUBJECT_CATEGORIES.ENGLISH.category)
      ).toThrow();
      expect(() =>
        compareSubjectOrder(SUBJECT_CATEGORIES.ENGLISH.category, null as unknown as string)
      ).toThrow();
    });

    it('科目名がundefinedの場合、エラーを返す - エラーケース', () => {
      expect(() =>
        compareSubjectOrder(undefined as unknown as string, SUBJECT_CATEGORIES.ENGLISH.category)
      ).toThrow();
      expect(() =>
        compareSubjectOrder(SUBJECT_CATEGORIES.ENGLISH.category, undefined as unknown as string)
      ).toThrow();
    });
  });

  /**
   * パフォーマンステスト
   * 大量のデータを処理する際の性能を検証
   */
  describe('パフォーマンステスト', () => {
    it('大量のデータを処理できる - 性能テスト', () => {
      const startTime = performance.now();

      for (let i = 0; i < 1000; i++) {
        getSubjectBaseCategory(SUBJECT_CATEGORIES.ENGLISH.category);
      }

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      expect(executionTime).toBeLessThan(100); // 100ms以内に処理が完了することを期待
    });

    it('キャッシュが機能している - 性能テスト', () => {
      const startTime = performance.now();

      // 同じ科目を複数回取得
      for (let i = 0; i < 1000; i++) {
        getSubjectBaseCategory(SUBJECT_CATEGORIES.ENGLISH.category);
      }

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      expect(executionTime).toBeLessThan(50); // キャッシュにより50ms以内に処理が完了することを期待
    });
  });
});
