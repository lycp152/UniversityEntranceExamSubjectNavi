import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { ValidationException, handleZodError, validateApiResponse } from './api-validation';
import { ValidationErrorCode, ValidationSeverity } from '@/constants/validation-constants';

/**
 * テスト用の共通データ
 */
const TEST_DATA = {
  valid: {
    name: 'テスト',
    age: 20,
  },
  invalid: {
    name: 123,
    age: '20',
  },
  schema: z.object({
    name: z.string(),
    age: z.number(),
  }),
};

/**
 * テスト用のエラーデータ
 */
const TEST_ERROR = {
  code: ValidationErrorCode.INVALID_DATA_FORMAT,
  message: 'テストエラー',
  field: 'test',
  severity: ValidationSeverity.ERROR,
};

describe('api-validation', () => {
  describe('ValidationException', () => {
    describe('例外の生成', () => {
      it('正しいエラー情報を持つ例外を生成する', () => {
        const exception = new ValidationException([TEST_ERROR]);

        expect(exception).toBeInstanceOf(Error);
        expect(exception.name).toBe('ValidationException');
        expect(exception.errors).toEqual([TEST_ERROR]);
      });

      it('エラーメッセージが正しく設定される', () => {
        const exception = new ValidationException([TEST_ERROR]);
        expect(exception.message).toBeDefined();
        expect(typeof exception.message).toBe('string');
      });
    });
  });

  describe('handleZodError', () => {
    describe('Zodエラーの変換', () => {
      it('ZodエラーをValidationExceptionに変換する', () => {
        try {
          TEST_DATA.schema.parse(TEST_DATA.invalid);
        } catch (error) {
          if (error instanceof z.ZodError) {
            const exception = handleZodError(error);

            expect(exception).toBeInstanceOf(ValidationException);
            expect(exception.errors).toHaveLength(2);
            expect(exception.errors[0].code).toBe(ValidationErrorCode.INVALID_DATA_FORMAT);
            expect(exception.errors[0].field).toBe('name');
            expect(exception.errors[1].field).toBe('age');
          }
        }
      });

      it('エラーメッセージが正しく変換される', () => {
        try {
          TEST_DATA.schema.parse(TEST_DATA.invalid);
        } catch (error) {
          if (error instanceof z.ZodError) {
            const exception = handleZodError(error);
            expect(exception.errors[0].message).toBeDefined();
            expect(typeof exception.errors[0].message).toBe('string');
          }
        }
      });
    });
  });

  describe('validateApiResponse', () => {
    describe('データの検証', () => {
      it('正しいデータを検証する', async () => {
        const result = await validateApiResponse(TEST_DATA.schema, TEST_DATA.valid);
        expect(result).toEqual(TEST_DATA.valid);
      });

      it('不正なデータでValidationExceptionをスローする', async () => {
        await expect(validateApiResponse(TEST_DATA.schema, TEST_DATA.invalid)).rejects.toThrow(
          ValidationException
        );
      });

      it('予期せぬエラーでValidationExceptionをスローする', async () => {
        await expect(validateApiResponse(TEST_DATA.schema, null)).rejects.toThrow(
          ValidationException
        );
      });

      it('エラーメッセージが正しく設定される', async () => {
        try {
          await validateApiResponse(TEST_DATA.schema, null);
        } catch (error) {
          if (error instanceof ValidationException) {
            expect(error.errors[0].message).toBe('Expected object, received null');
          }
        }
      });
    });
  });
});
