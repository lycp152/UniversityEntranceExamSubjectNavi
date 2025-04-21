import { describe, it, expect } from 'vitest';
import {
  BaseModel,
  ValidationError,
  ValidationErrors,
  ValidationRule,
  commonValidationRules,
} from './base-types';

/**
 * 基本型定義のテスト
 * 型の整合性とバリデーションルールを検証
 */
describe('base-types', () => {
  /**
   * BaseModelの型定義テスト
   */
  describe('BaseModel', () => {
    it('正しい型のデータを検証できる', () => {
      const validModel: BaseModel = {
        id: 1,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        deleted_at: null,
        version: 1,
        created_by: 'user1',
        updated_by: 'user2',
      };

      expect(validModel).toBeDefined();
      expect(validModel.id).toBe(1);
      expect(validModel.created_at).toBe('2024-01-01T00:00:00Z');
      expect(validModel.deleted_at).toBeNull();
    });

    it('バリデーションルールが正しく動作する', () => {
      expect(commonValidationRules.id(1)).toBe(true);
      expect(commonValidationRules.id(0)).toBe(false);
      expect(commonValidationRules.id(-1)).toBe(false);

      expect(commonValidationRules.created_at('2024-01-01T00:00:00Z')).toBe(true);
      expect(commonValidationRules.created_at('invalid-date')).toBe(false);

      expect(commonValidationRules.created_by('user1')).toBe(true);
      expect(commonValidationRules.created_by('')).toBe(false);
      expect(commonValidationRules.created_by('a'.repeat(101))).toBe(false);
    });
  });

  /**
   * ValidationErrorの型定義テスト
   */
  describe('ValidationError', () => {
    it('正しい型のエラーを検証できる', () => {
      const error: ValidationError = {
        field: 'name',
        message: '名前は必須です',
        code: 'REQUIRED_FIELD',
        severity: 'error',
        err: new Error('テストエラー'),
        details: { value: null },
      };

      expect(error).toBeDefined();
      expect(error.field).toBe('name');
      expect(error.message).toBe('名前は必須です');
      expect(error.severity).toBe('error');
      expect(error.err).toBeInstanceOf(Error);
      expect(error.details).toEqual({ value: null });
    });
  });

  /**
   * ValidationErrorsの型定義テスト
   */
  describe('ValidationErrors', () => {
    it('複数のエラーを検証できる', () => {
      const errors: ValidationErrors = {
        errors: [
          {
            field: 'name',
            message: '名前は必須です',
            code: 'REQUIRED_FIELD',
            severity: 'error',
          },
          {
            field: 'email',
            message: 'メールアドレスの形式が不正です',
            code: 'INVALID_FORMAT',
            severity: 'error',
          },
        ],
      };

      expect(errors).toBeDefined();
      expect(errors.errors).toHaveLength(2);
      expect(errors.errors[0].field).toBe('name');
      expect(errors.errors[1].field).toBe('email');
    });
  });

  /**
   * ValidationRuleの型定義テスト
   */
  describe('ValidationRule', () => {
    it('バリデーションルールを検証できる', () => {
      const rule: ValidationRule<string> = {
        field: 'name',
        condition: value => value.length > 0,
        message: '名前は必須です',
        code: 'REQUIRED_FIELD',
      };

      expect(rule).toBeDefined();
      expect(rule.field).toBe('name');
      expect(rule.condition('test')).toBe(true);
      expect(rule.condition('')).toBe(false);
      expect(rule.message).toBe('名前は必須です');
    });
  });
});
