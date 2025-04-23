/**
 * 試験区分の制約のテスト
 * 型定義と制約値の検証を行います
 */

import { describe, it, expect } from 'vitest';
import {
  EXAM_TYPES,
  EXAM_TYPE_CONSTRAINTS,
  ExamType,
  ExamTypeId,
  ExamTypeName,
} from './exam-types';

describe('試験区分の制約', () => {
  describe('試験区分の定義', () => {
    it('共通試験の定義が正しいこと', () => {
      expect(EXAM_TYPES.COMMON).toEqual({
        name: '共通',
        formalName: '共通テスト',
        id: 1,
        color: '#4169E1',
      });
    });

    it('二次試験の定義が正しいこと', () => {
      expect(EXAM_TYPES.SECONDARY).toEqual({
        name: '二次',
        formalName: '二次試験',
        id: 2,
        color: '#A9A9A9',
      });
    });

    it('試験区分の型が正しいこと', () => {
      const validType: ExamType = '共通';
      expect(validType).toBe('共通');
    });

    it('試験区分IDの型が正しいこと', () => {
      const validId: ExamTypeId = 1;
      expect(validId).toBe(1);
    });
  });

  describe('試験区分の制約', () => {
    it('試験区分名の最大長が正しいこと', () => {
      expect(EXAM_TYPE_CONSTRAINTS.MAX_NAME_LENGTH).toBe(10);
    });

    it('有効な試験区分名が正しいこと', () => {
      expect(EXAM_TYPE_CONSTRAINTS.VALID_NAMES).toEqual(['共通', '二次']);
    });

    it('試験区分名の型が正しいこと', () => {
      const validName: ExamTypeName = '共通';
      expect(validName).toBe('共通');
    });
  });
});
