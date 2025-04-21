/**
 * 科目カテゴリの制約のテスト
 * 型定義と制約値の検証を行います
 */

import { describe, it, expect } from 'vitest';
import {
  SUBJECT_CATEGORIES,
  SUBJECT_CATEGORY_CONSTRAINTS,
  SubjectCategory,
  SubjectCategoryName,
} from './subject-categories';

describe('科目カテゴリの制約', () => {
  describe('カテゴリの定義', () => {
    it('英語カテゴリの定義が正しいこと', () => {
      expect(SUBJECT_CATEGORIES.ENGLISH).toEqual({
        category: '英語',
        color: '#DAA520',
      });
    });

    it('数学カテゴリの定義が正しいこと', () => {
      expect(SUBJECT_CATEGORIES.MATH).toEqual({
        category: '数学',
        color: '#0047AB',
      });
    });

    it('国語カテゴリの定義が正しいこと', () => {
      expect(SUBJECT_CATEGORIES.JAPANESE).toEqual({
        category: '国語',
        color: '#228B22',
      });
    });

    it('理科カテゴリの定義が正しいこと', () => {
      expect(SUBJECT_CATEGORIES.SCIENCE).toEqual({
        category: '理科',
        color: '#D35400',
      });
    });

    it('地歴公カテゴリの定義が正しいこと', () => {
      expect(SUBJECT_CATEGORIES.SOCIAL).toEqual({
        category: '地歴公',
        color: '#C71585',
      });
    });

    it('カテゴリの型が正しいこと', () => {
      const validCategory: SubjectCategory = 'ENGLISH';
      expect(validCategory).toBe('ENGLISH');
    });
  });

  describe('カテゴリの制約', () => {
    it('カテゴリ名の最大長が正しいこと', () => {
      expect(SUBJECT_CATEGORY_CONSTRAINTS.MAX_CATEGORY_NAME_LENGTH).toBe(10);
    });

    it('カテゴリ名の最小長が正しいこと', () => {
      expect(SUBJECT_CATEGORY_CONSTRAINTS.MIN_CATEGORY_NAME_LENGTH).toBe(1);
    });

    it('カテゴリの最大数が正しいこと', () => {
      expect(SUBJECT_CATEGORY_CONSTRAINTS.MAX_CATEGORIES).toBe(5);
    });

    it('カテゴリ名の型が正しいこと', () => {
      const validName: SubjectCategoryName = '英語';
      expect(validName).toBe('英語');
    });
  });
});
