/**
 * 入試情報の制約のテスト
 * 型定義と制約値の検証を行います
 */

import { describe, it, expect } from 'vitest';
import {
  ADMISSION_INFO_CONSTRAINTS,
  AdmissionStatus,
  Enrollment,
  AcademicYear,
  StatusTransition,
} from './admission-info';

describe('入試情報の制約', () => {
  describe('ステータスの制約', () => {
    it('ステータスの最大長が正しいこと', () => {
      expect(ADMISSION_INFO_CONSTRAINTS.MAX_STATUS_LENGTH).toBe(20);
    });

    it('有効なステータス値が正しいこと', () => {
      expect(ADMISSION_INFO_CONSTRAINTS.VALID_STATUSES).toEqual(['draft', 'published', 'archived']);
    });

    it('ステータスの型が正しいこと', () => {
      const validStatus: AdmissionStatus = 'draft';
      expect(validStatus).toBe('draft');
    });
  });

  describe('定員の制約', () => {
    it('定員の最小値が正しいこと', () => {
      expect(ADMISSION_INFO_CONSTRAINTS.MIN_ENROLLMENT).toBe(1);
    });

    it('定員の最大値が正しいこと', () => {
      expect(ADMISSION_INFO_CONSTRAINTS.MAX_ENROLLMENT).toBe(9999);
    });

    it('定員の型が正しいこと', () => {
      const validEnrollment = 100 as Enrollment;
      expect(validEnrollment).toBe(100);
    });
  });

  describe('学年度の制約', () => {
    it('学年度の最小値が正しいこと', () => {
      expect(ADMISSION_INFO_CONSTRAINTS.MIN_ACADEMIC_YEAR).toBe(2000);
    });

    it('学年度の最大値が正しいこと', () => {
      expect(ADMISSION_INFO_CONSTRAINTS.MAX_ACADEMIC_YEAR).toBe(2100);
    });

    it('学年度の型が正しいこと', () => {
      const validYear = 2024 as AcademicYear;
      expect(validYear).toBe(2024);
    });
  });

  describe('ステータス遷移の制約', () => {
    it('ステータス遷移の定義が正しいこと', () => {
      expect(ADMISSION_INFO_CONSTRAINTS.STATUS_TRANSITIONS).toEqual({
        draft: ['published', 'archived'],
        published: ['archived'],
        archived: ['draft'],
      });
    });

    it('ステータス遷移の型が正しいこと', () => {
      const validTransition: StatusTransition = 'draft';
      expect(validTransition).toBe('draft');
    });
  });
});
