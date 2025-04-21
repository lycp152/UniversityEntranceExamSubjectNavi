/**
 * 入試スケジュールの制約のテスト
 * 型定義と制約値の検証を行います
 */

import { describe, it, expect } from 'vitest';
import {
  ADMISSION_SCHEDULE_CONSTRAINTS,
  AdmissionScheduleName,
  DisplayOrder,
  DisplayOrderConstraint,
} from './admission-schedule';

describe('入試スケジュールの制約', () => {
  describe('名前の制約', () => {
    it('名前の最大長が正しいこと', () => {
      expect(ADMISSION_SCHEDULE_CONSTRAINTS.MAX_NAME_LENGTH).toBe(6);
    });

    it('有効な入試スケジュール名が正しいこと', () => {
      expect(ADMISSION_SCHEDULE_CONSTRAINTS.VALID_NAMES).toEqual(['前', '中', '後']);
    });

    it('入試スケジュール名の型が正しいこと', () => {
      const validName: AdmissionScheduleName = '前';
      expect(validName).toBe('前');
    });
  });

  describe('表示順序の制約', () => {
    it('表示順序の最小値が正しいこと', () => {
      expect(ADMISSION_SCHEDULE_CONSTRAINTS.MIN_DISPLAY_ORDER).toBe(0);
    });

    it('表示順序の最大値が正しいこと', () => {
      expect(ADMISSION_SCHEDULE_CONSTRAINTS.MAX_DISPLAY_ORDER).toBe(3);
    });

    it('表示順序の型が正しいこと', () => {
      const validOrder = 1 as DisplayOrder;
      expect(validOrder).toBe(1);
    });
  });

  describe('表示順序制約の定義', () => {
    it('表示順序制約の定義が正しいこと', () => {
      expect(ADMISSION_SCHEDULE_CONSTRAINTS.DISPLAY_ORDER_CONSTRAINTS).toEqual({
        MIN: 0,
        MAX: 3,
        DEFAULT: 0,
      });
    });

    it('表示順序制約の型が正しいこと', () => {
      const constraints: DisplayOrderConstraint =
        ADMISSION_SCHEDULE_CONSTRAINTS.DISPLAY_ORDER_CONSTRAINTS;
      expect(constraints.MIN).toBe(0);
      expect(constraints.MAX).toBe(3);
      expect(constraints.DEFAULT).toBe(0);
    });
  });
});
