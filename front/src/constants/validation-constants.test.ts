import { describe, it, expect } from 'vitest';
import {
  ValidationSeverity,
  ValidationCategory,
  ValidationErrorCode,
  ValidationDefaults,
  ValidationMessages,
} from './validation-constants';

/**
 * テストデータ
 */
const TEST_DATA = {
  severity: {
    values: {
      ERROR: 'error',
      WARNING: 'warning',
      INFO: 'info',
    },
  },
  category: {
    values: {
      TRANSFORM: 'transform',
      FORMAT: 'format',
      REQUIRED: 'required',
      CALCULATION: 'calculation',
      RENDER: 'render',
    },
  },
  errorCode: {
    values: {
      TRANSFORM_ERROR: 'TRANSFORM_ERROR',
      INVALID_DATA_FORMAT: 'INVALID_DATA_FORMAT',
      MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
      CALCULATION_ERROR: 'CALCULATION_ERROR',
      INVALID_PERCENTAGE: 'INVALID_PERCENTAGE',
      TOTAL_EXCEEDED: 'TOTAL_EXCEEDED',
      RENDER_ERROR: 'RENDER_ERROR',
      INVALID_DIMENSIONS: 'INVALID_DIMENSIONS',
      OVERFLOW_ERROR: 'OVERFLOW_ERROR',
    },
    messages: {
      TRANSFORM_ERROR: 'データの変換に失敗しました',
      INVALID_DATA_FORMAT: 'データの形式が無効です',
      MISSING_REQUIRED_FIELD: '必須項目が未入力です',
      CALCULATION_ERROR: '計算エラーが発生しました',
      INVALID_PERCENTAGE: 'パーセンテージの値が無効です',
      TOTAL_EXCEEDED: '合計値が上限を超えています',
      RENDER_ERROR: '表示エラーが発生しました',
      INVALID_DIMENSIONS: '寸法の値が無効です',
      OVERFLOW_ERROR: 'オーバーフローエラーが発生しました',
    },
  },
} as const;

/**
 * バリデーション定数のテスト
 * 定数の値、型、エラーメッセージの正確性を検証
 */
describe('バリデーション定数', () => {
  /**
   * バリデーションの重要度（ValidationSeverity）のテスト
   */
  describe('ValidationSeverity', () => {
    it('正しい重要度の値を持つこと', () => {
      expect(ValidationSeverity.ERROR).toBe(TEST_DATA.severity.values.ERROR);
      expect(ValidationSeverity.WARNING).toBe(TEST_DATA.severity.values.WARNING);
      expect(ValidationSeverity.INFO).toBe(TEST_DATA.severity.values.INFO);
    });

    it('全ての重要度が文字列型であること', () => {
      expect(typeof ValidationSeverity.ERROR).toBe('string');
      expect(typeof ValidationSeverity.WARNING).toBe('string');
      expect(typeof ValidationSeverity.INFO).toBe('string');
    });
  });

  /**
   * バリデーションのカテゴリー（ValidationCategory）のテスト
   */
  describe('ValidationCategory', () => {
    it('正しいカテゴリーの値を持つこと', () => {
      expect(ValidationCategory.TRANSFORM).toBe(TEST_DATA.category.values.TRANSFORM);
      expect(ValidationCategory.FORMAT).toBe(TEST_DATA.category.values.FORMAT);
      expect(ValidationCategory.REQUIRED).toBe(TEST_DATA.category.values.REQUIRED);
      expect(ValidationCategory.CALCULATION).toBe(TEST_DATA.category.values.CALCULATION);
      expect(ValidationCategory.RENDER).toBe(TEST_DATA.category.values.RENDER);
    });

    it('全てのカテゴリーが文字列型であること', () => {
      expect(typeof ValidationCategory.TRANSFORM).toBe('string');
      expect(typeof ValidationCategory.FORMAT).toBe('string');
      expect(typeof ValidationCategory.REQUIRED).toBe('string');
      expect(typeof ValidationCategory.CALCULATION).toBe('string');
      expect(typeof ValidationCategory.RENDER).toBe('string');
    });
  });

  /**
   * バリデーションエラーコード（ValidationErrorCode）のテスト
   */
  describe('ValidationErrorCode', () => {
    it('正しいエラーコードの値を持つこと', () => {
      expect(ValidationErrorCode.TRANSFORM_ERROR).toBe(TEST_DATA.errorCode.values.TRANSFORM_ERROR);
      expect(ValidationErrorCode.INVALID_DATA_FORMAT).toBe(
        TEST_DATA.errorCode.values.INVALID_DATA_FORMAT
      );
      expect(ValidationErrorCode.MISSING_REQUIRED_FIELD).toBe(
        TEST_DATA.errorCode.values.MISSING_REQUIRED_FIELD
      );
      expect(ValidationErrorCode.CALCULATION_ERROR).toBe(
        TEST_DATA.errorCode.values.CALCULATION_ERROR
      );
      expect(ValidationErrorCode.INVALID_PERCENTAGE).toBe(
        TEST_DATA.errorCode.values.INVALID_PERCENTAGE
      );
      expect(ValidationErrorCode.TOTAL_EXCEEDED).toBe(TEST_DATA.errorCode.values.TOTAL_EXCEEDED);
      expect(ValidationErrorCode.RENDER_ERROR).toBe(TEST_DATA.errorCode.values.RENDER_ERROR);
      expect(ValidationErrorCode.INVALID_DIMENSIONS).toBe(
        TEST_DATA.errorCode.values.INVALID_DIMENSIONS
      );
      expect(ValidationErrorCode.OVERFLOW_ERROR).toBe(TEST_DATA.errorCode.values.OVERFLOW_ERROR);
    });

    it('全てのエラーコードが文字列型であること', () => {
      const errorCodes = [
        ValidationErrorCode.TRANSFORM_ERROR,
        ValidationErrorCode.INVALID_DATA_FORMAT,
        ValidationErrorCode.MISSING_REQUIRED_FIELD,
        ValidationErrorCode.CALCULATION_ERROR,
        ValidationErrorCode.INVALID_PERCENTAGE,
        ValidationErrorCode.TOTAL_EXCEEDED,
        ValidationErrorCode.RENDER_ERROR,
        ValidationErrorCode.INVALID_DIMENSIONS,
        ValidationErrorCode.OVERFLOW_ERROR,
      ];

      errorCodes.forEach(code => {
        expect(typeof code).toBe('string');
      });
    });
  });

  /**
   * バリデーションのデフォルト設定（ValidationDefaults）のテスト
   */
  describe('ValidationDefaults', () => {
    it('デフォルトの重要度が正しいこと', () => {
      expect(ValidationDefaults.severity).toBe(ValidationSeverity.ERROR);
    });

    it('デフォルトのカテゴリーが正しいこと', () => {
      expect(ValidationDefaults.category).toBe(ValidationCategory.TRANSFORM);
    });
  });

  /**
   * バリデーションのエラーメッセージ（ValidationMessages）のテスト
   */
  describe('ValidationMessages', () => {
    it('全てのエラーコードに対応するメッセージが存在すること', () => {
      const errorCodes = [
        ValidationErrorCode.TRANSFORM_ERROR,
        ValidationErrorCode.INVALID_DATA_FORMAT,
        ValidationErrorCode.MISSING_REQUIRED_FIELD,
        ValidationErrorCode.CALCULATION_ERROR,
        ValidationErrorCode.INVALID_PERCENTAGE,
        ValidationErrorCode.TOTAL_EXCEEDED,
        ValidationErrorCode.RENDER_ERROR,
        ValidationErrorCode.INVALID_DIMENSIONS,
        ValidationErrorCode.OVERFLOW_ERROR,
      ];

      errorCodes.forEach(code => {
        expect(ValidationMessages[code]).toBeDefined();
        expect(typeof ValidationMessages[code]).toBe('string');
      });
    });

    it('エラーメッセージが日本語で正しく定義されていること', () => {
      expect(ValidationMessages[ValidationErrorCode.TRANSFORM_ERROR]).toBe(
        TEST_DATA.errorCode.messages.TRANSFORM_ERROR
      );
      expect(ValidationMessages[ValidationErrorCode.INVALID_DATA_FORMAT]).toBe(
        TEST_DATA.errorCode.messages.INVALID_DATA_FORMAT
      );
      expect(ValidationMessages[ValidationErrorCode.MISSING_REQUIRED_FIELD]).toBe(
        TEST_DATA.errorCode.messages.MISSING_REQUIRED_FIELD
      );
      expect(ValidationMessages[ValidationErrorCode.CALCULATION_ERROR]).toBe(
        TEST_DATA.errorCode.messages.CALCULATION_ERROR
      );
      expect(ValidationMessages[ValidationErrorCode.INVALID_PERCENTAGE]).toBe(
        TEST_DATA.errorCode.messages.INVALID_PERCENTAGE
      );
      expect(ValidationMessages[ValidationErrorCode.TOTAL_EXCEEDED]).toBe(
        TEST_DATA.errorCode.messages.TOTAL_EXCEEDED
      );
      expect(ValidationMessages[ValidationErrorCode.RENDER_ERROR]).toBe(
        TEST_DATA.errorCode.messages.RENDER_ERROR
      );
      expect(ValidationMessages[ValidationErrorCode.INVALID_DIMENSIONS]).toBe(
        TEST_DATA.errorCode.messages.INVALID_DIMENSIONS
      );
      expect(ValidationMessages[ValidationErrorCode.OVERFLOW_ERROR]).toBe(
        TEST_DATA.errorCode.messages.OVERFLOW_ERROR
      );
    });
  });
});
