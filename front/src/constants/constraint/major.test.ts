/**
 * 学科名の制約のテスト
 * 型定義と制約値の検証を行います
 */

import { describe, it, expect } from 'vitest';
import { MAJOR_CONSTRAINTS } from './major';

describe('学科名の制約', () => {
  describe('学科名の長さ制約', () => {
    it('学科名の最小長が正しいこと', () => {
      expect(MAJOR_CONSTRAINTS.MIN_LENGTH).toBe(1);
    });

    it('学科名の最大長が正しいこと', () => {
      expect(MAJOR_CONSTRAINTS.MAX_LENGTH).toBe(20);
    });
  });
});
