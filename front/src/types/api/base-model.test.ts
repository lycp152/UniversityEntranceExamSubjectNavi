import { describe, it, expect } from 'vitest';
import type { BaseModel, ValidationErrors } from './base-model';
import type { ValidationError } from '@/types/api/validation';
import { ValidationErrorCode, ValidationSeverity } from '@/constants/validation-constants';

/**
 * BaseModelの型定義のテスト
 * 型の整合性と型安全性を検証します
 */
describe('BaseModelの型定義', () => {
  it('必須フィールドが正しく定義されている', () => {
    const model: BaseModel = {
      id: 1,
      version: 1,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      createdBy: 'test-user',
      updatedBy: 'test-user',
    };

    expect(model.id).toBe(1);
    expect(model.version).toBe(1);
    expect(model.createdAt).toBe('2024-01-01T00:00:00Z');
    expect(model.updatedAt).toBe('2024-01-01T00:00:00Z');
    expect(model.createdBy).toBe('test-user');
    expect(model.updatedBy).toBe('test-user');
  });

  it('オプショナルフィールドが正しく定義されている', () => {
    const model: BaseModel = {
      id: 1,
      version: 1,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      deletedAt: null,
      createdBy: 'test-user',
      updatedBy: 'test-user',
    };

    expect(model.deletedAt).toBeNull();
  });

  it('日時フォーマットが正しい', () => {
    const model: BaseModel = {
      id: 1,
      version: 1,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      createdBy: 'test-user',
      updatedBy: 'test-user',
    };

    // ISO 8601形式の日時フォーマットを検証
    expect(model.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
    expect(model.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
  });

  it('ValidationErrorsの型が正しく定義されている', () => {
    const errors: ValidationErrors = {
      errors: [
        {
          field: 'testField',
          code: ValidationErrorCode.TRANSFORM_ERROR,
          message: 'エラーメッセージ1',
          severity: ValidationSeverity.ERROR,
        },
      ],
    };

    expect(errors.errors).toHaveLength(1);
    expect(errors.errors[0].field).toBe('testField');
    expect(errors.errors[0].code).toBe(ValidationErrorCode.TRANSFORM_ERROR);
    expect(errors.errors[0].message).toBe('エラーメッセージ1');
    expect(errors.errors[0].severity).toBe(ValidationSeverity.ERROR);
  });

  it('複数のエラーを保持できること', () => {
    const errors: ValidationErrors = {
      errors: [
        {
          field: 'testField1',
          code: ValidationErrorCode.TRANSFORM_ERROR,
          message: 'エラーメッセージ1',
          severity: ValidationSeverity.ERROR,
        },
        {
          field: 'testField2',
          code: ValidationErrorCode.INVALID_DATA_FORMAT,
          message: '警告メッセージ1',
          severity: ValidationSeverity.WARNING,
        },
      ],
    };

    expect(errors.errors).toHaveLength(2);
    expect(errors.errors[0].field).toBe('testField1');
    expect(errors.errors[0].severity).toBe(ValidationSeverity.ERROR);
    expect(errors.errors[1].field).toBe('testField2');
    expect(errors.errors[1].severity).toBe(ValidationSeverity.WARNING);
  });
});

/**
 * APIの基本型定義のテスト
 * 型の整合性と型安全性を確認します
 */
describe('APIの基本型定義', () => {
  describe('ValidationError型の検証', () => {
    it('必須フィールドが正しく定義されている', () => {
      const error: ValidationError = {
        field: 'testField',
        message: 'テストエラーメッセージ',
        code: ValidationErrorCode.TRANSFORM_ERROR,
        severity: ValidationSeverity.ERROR,
      };

      expect(error.field).toBe('testField');
      expect(error.message).toBe('テストエラーメッセージ');
      expect(error.code).toBe(ValidationErrorCode.TRANSFORM_ERROR);
      expect(error.severity).toBe(ValidationSeverity.ERROR);
    });

    it('オプショナルフィールドが正しく定義されている', () => {
      const error: ValidationError = {
        field: 'testField',
        message: 'テストエラーメッセージ',
        code: ValidationErrorCode.TRANSFORM_ERROR,
        severity: ValidationSeverity.ERROR,
        metadata: { additionalInfo: '追加情報' },
      };

      expect(error.metadata).toEqual({ additionalInfo: '追加情報' });
    });
  });

  describe('ValidationErrors型の検証', () => {
    it('エラー配列が正しく定義されている', () => {
      const errors: ValidationErrors = {
        errors: [
          {
            field: 'testField1',
            message: 'テストエラーメッセージ1',
            code: ValidationErrorCode.TRANSFORM_ERROR,
            severity: ValidationSeverity.ERROR,
          },
          {
            field: 'testField2',
            message: 'テストエラーメッセージ2',
            code: ValidationErrorCode.INVALID_DATA_FORMAT,
            severity: ValidationSeverity.WARNING,
          },
        ],
      };

      expect(errors.errors).toHaveLength(2);
      expect(errors.errors[0].field).toBe('testField1');
      expect(errors.errors[1].field).toBe('testField2');
    });
  });

  describe('BaseModel型の検証', () => {
    it('BaseModelの必須フィールドが正しく定義されている', () => {
      const model: BaseModel = {
        id: 1,
        version: 1,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        deletedAt: null,
        createdBy: 'test-user',
        updatedBy: 'test-user',
      };

      expect(model.id).toBe(1);
      expect(model.version).toBe(1);
      expect(model.createdAt).toBe('2024-01-01T00:00:00Z');
      expect(model.updatedAt).toBe('2024-01-01T00:00:00Z');
      expect(model.deletedAt).toBeNull();
      expect(model.createdBy).toBe('test-user');
      expect(model.updatedBy).toBe('test-user');
    });
  });
});
