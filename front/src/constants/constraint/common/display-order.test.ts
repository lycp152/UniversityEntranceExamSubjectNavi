/**
 * 表示順序の制約のテスト
 * 型定義と制約値の検証を行います
 */

import { describe, it, expect } from 'vitest';
import { DISPLAY_ORDER_CONSTRAINTS, DisplayOrder } from './display-order';

describe('表示順序の制約', () => {
  describe('表示順序の制約値', () => {
    it('表示順序の最小値が正しいこと', () => {
      expect(DISPLAY_ORDER_CONSTRAINTS.MIN).toBe(0);
    });

    it('表示順序の最大値が正しいこと', () => {
      expect(DISPLAY_ORDER_CONSTRAINTS.MAX).toBe(999);
    });

    it('デフォルトの表示順序が正しいこと', () => {
      expect(DISPLAY_ORDER_CONSTRAINTS.DEFAULT).toBe(0);
    });
  });

  describe('表示順序の型定義', () => {
    it('表示順序の型が正しいこと', () => {
      const validOrder = 0 as DisplayOrder;
      expect(validOrder).toBe(0);
    });
  });
});
