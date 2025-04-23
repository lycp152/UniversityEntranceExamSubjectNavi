/**
 * 学部名の制約のテスト
 * 型定義と制約値の検証を行います
 */

import { describe, it, expect } from 'vitest';
import { DEPARTMENT_CONSTRAINTS, DepartmentName } from './department';

describe('学部名の制約', () => {
  describe('学部名の長さ制約', () => {
    it('学部名の最小長が正しいこと', () => {
      expect(DEPARTMENT_CONSTRAINTS.MIN_LENGTH).toBe(1);
    });

    it('学部名の最大長が正しいこと', () => {
      expect(DEPARTMENT_CONSTRAINTS.MAX_LENGTH).toBe(20);
    });
  });

  describe('学部名の型定義', () => {
    it('学部名の型が正しいこと', () => {
      const validName = '法学部' as string as DepartmentName;
      expect(validName).toBe('法学部');
    });
  });
});
