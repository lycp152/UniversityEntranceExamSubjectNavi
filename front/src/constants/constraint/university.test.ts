/**
 * 大学名の制約のテスト
 * 型定義と制約値の検証を行います
 */

import { describe, it, expect } from 'vitest';
import { UNIVERSITY_CONSTRAINTS, UniversityName } from './university';

describe('大学名の制約', () => {
  describe('大学名の長さ制約', () => {
    it('大学名の最小長が正しいこと', () => {
      expect(UNIVERSITY_CONSTRAINTS.MIN_LENGTH).toBe(1);
    });

    it('大学名の最大長が正しいこと', () => {
      expect(UNIVERSITY_CONSTRAINTS.MAX_LENGTH).toBe(20);
    });
  });

  describe('大学名の型定義', () => {
    it('大学名の型が正しいこと', () => {
      const validName = '東京大学' as string as UniversityName;
      expect(validName).toBe('東京大学');
    });
  });
});
