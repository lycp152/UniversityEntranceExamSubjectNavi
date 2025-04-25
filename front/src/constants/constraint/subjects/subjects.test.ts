/**
 * 科目の定義のテスト
 * 型定義と定数値の検証を行います
 */

import { describe, it, expect } from 'vitest';
import { SUBJECTS, SUBJECT_NAME_CONSTRAINTS, SubjectName, SubjectNameLength } from './subjects';

describe('科目の定義', () => {
  describe('科目名の定義', () => {
    it('英語リーディングの定義が正しいこと', () => {
      expect(SUBJECTS.ENGLISH_R).toBe('英語R');
    });

    it('英語リスニングの定義が正しいこと', () => {
      expect(SUBJECTS.ENGLISH_L).toBe('英語L');
    });

    it('数学の定義が正しいこと', () => {
      expect(SUBJECTS.MATH).toBe('数学');
    });

    it('国語の定義が正しいこと', () => {
      expect(SUBJECTS.JAPANESE).toBe('国語');
    });

    it('理科の定義が正しいこと', () => {
      expect(SUBJECTS.SCIENCE).toBe('理科');
    });

    it('地歴公の定義が正しいこと', () => {
      expect(SUBJECTS.SOCIAL).toBe('地歴公');
    });
  });

  describe('科目名の型定義', () => {
    it('科目名の型が正しいこと', () => {
      const validName: SubjectName = '英語R';
      expect(validName).toBe('英語R');
    });
  });
});

/**
 * 科目名の制約のテスト
 * 型定義と制約値の検証を行います
 */

describe('科目名の制約', () => {
  describe('科目名の長さ制約', () => {
    it('科目名の最大長が正しいこと', () => {
      expect(SUBJECT_NAME_CONSTRAINTS.MAX_LENGTH).toBe(20);
    });

    it('科目名が空でないことが制約されていること', () => {
      expect(SUBJECT_NAME_CONSTRAINTS.NOT_EMPTY).toBe(true);
    });
  });

  describe('科目名の型定義', () => {
    it('科目名の長さの型が正しいこと', () => {
      const validLength = 1 as SubjectNameLength;
      expect(validLength).toBe(1);
    });
  });
});
