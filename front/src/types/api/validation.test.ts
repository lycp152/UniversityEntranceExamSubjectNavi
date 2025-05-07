/**
 * バリデーション型定義のテスト
 * 各型定義の期待される動作を検証
 *
 * @module validation-types-test
 * @description
 * - ValidationErrorの型チェック
 * - ValidationResultの型チェック
 * - ValidationRuleの型チェック
 * - ValidationContextの型チェック
 * - ValidationMetadataの型チェック
 * - ScoreValidationRulesの型チェック
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type {
  ValidationError,
  ValidationResult,
  ValidationRule,
  ValidationContext,
  ValidationMetadata,
  ScoreValidationRules,
} from './validation';
import {
  ValidationCategory,
  ValidationErrorCode,
  ValidationSeverity,
} from '@/constants/validation-constants';

// テストデータの定義
const TEST_TIMESTAMP = 1234567890;
const TEST_METADATA = { additional: 'info' };
const TEST_RULES = ['rule1', 'rule2'];
const TEST_PERFORMANCE = {
  validationDuration: 50,
  ruleExecutionTimes: {
    rule1: 20,
    rule2: 30,
  },
};

describe('バリデーション型定義のテスト', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(TEST_TIMESTAMP);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('ValidationError', () => {
    it('必須フィールドが正しく定義されていること', () => {
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

    it('オプショナルフィールドが正しく定義されていること', () => {
      const error: ValidationError = {
        field: 'testField',
        message: 'テストエラーメッセージ',
        code: ValidationErrorCode.TRANSFORM_ERROR,
        severity: ValidationSeverity.ERROR,
        metadata: TEST_METADATA,
        category: ValidationCategory.TRANSFORM,
        value: 'testValue',
      };

      expect(error.metadata).toEqual(TEST_METADATA);
      expect(error.category).toBe(ValidationCategory.TRANSFORM);
      expect(error.value).toBe('testValue');
    });
  });

  describe('ValidationResult', () => {
    it('必須フィールドが正しく定義されていること', () => {
      const result: ValidationResult = {
        isValid: true,
        errors: [],
      };

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('オプショナルフィールドが正しく定義されていること', () => {
      const result: ValidationResult<string> = {
        isValid: true,
        errors: [],
        metadata: {
          validatedAt: TEST_TIMESTAMP,
        },
        data: 'testData',
      };

      expect(result.metadata).toBeDefined();
      expect(result.data).toBe('testData');
    });
  });

  describe('ValidationRule', () => {
    it('必須フィールドが正しく定義されていること', () => {
      const rule: ValidationRule<string> = {
        field: 'testField',
        condition: value => value.length > 0,
        message: 'テストメッセージ',
        code: ValidationErrorCode.TRANSFORM_ERROR,
        severity: ValidationSeverity.ERROR,
        category: ValidationCategory.TRANSFORM,
      };

      expect(rule.field).toBe('testField');
      expect(rule.condition('test')).toBe(true);
      expect(rule.message).toBe('テストメッセージ');
      expect(rule.code).toBe(ValidationErrorCode.TRANSFORM_ERROR);
      expect(rule.severity).toBe(ValidationSeverity.ERROR);
      expect(rule.category).toBe(ValidationCategory.TRANSFORM);
    });
  });

  describe('ValidationContext', () => {
    it('必須フィールドが正しく定義されていること', () => {
      const context: ValidationContext = {
        fieldName: 'testField',
        value: 'testValue',
        timestamp: TEST_TIMESTAMP,
      };

      expect(context.fieldName).toBe('testField');
      expect(context.value).toBe('testValue');
      expect(context.timestamp).toBe(TEST_TIMESTAMP);
    });
  });

  describe('ValidationMetadata', () => {
    it('必須フィールドが正しく定義されていること', () => {
      const metadata: ValidationMetadata = {
        validatedAt: TEST_TIMESTAMP,
      };

      expect(metadata.validatedAt).toBe(TEST_TIMESTAMP);
    });

    it('オプショナルフィールドが正しく定義されていること', () => {
      const metadata: ValidationMetadata = {
        validatedAt: TEST_TIMESTAMP,
        rules: TEST_RULES,
        processedAt: TEST_TIMESTAMP,
        totalItems: 10,
        successCount: 8,
        errorCount: 2,
        duration: 100,
        validationRules: TEST_RULES,
        performance: TEST_PERFORMANCE,
      };

      expect(metadata.rules).toEqual(TEST_RULES);
      expect(metadata.performance).toEqual(TEST_PERFORMANCE);
    });
  });

  describe('ScoreValidationRules', () => {
    it('必須フィールドが正しく定義されていること', () => {
      const rules: ScoreValidationRules = {
        commonTest: [],
        secondTest: [],
        total: [],
      };

      expect(rules.commonTest).toEqual([]);
      expect(rules.secondTest).toEqual([]);
      expect(rules.total).toEqual([]);
    });

    it('オプショナルフィールドが正しく定義されていること', () => {
      const rules: ScoreValidationRules = {
        commonTest: [],
        secondTest: [],
        total: [],
        min: 0,
        max: 100,
        isInteger: true,
        customRules: [],
        metadata: TEST_METADATA,
      };

      expect(rules.min).toBe(0);
      expect(rules.max).toBe(100);
      expect(rules.isInteger).toBe(true);
      expect(rules.metadata).toEqual(TEST_METADATA);
    });
  });
});
