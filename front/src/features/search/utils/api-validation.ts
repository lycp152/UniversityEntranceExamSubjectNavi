/**
 * APIバリデーション関連のモジュール
 * APIリクエストとレスポンスのバリデーション処理を提供
 *
 * @module api-validation
 * @description
 * - APIレスポンスのバリデーション
 * - Zodエラーの変換と処理
 * - バリデーション例外の定義
 */

import { z } from 'zod';
import { API_ERROR_CODES, ERROR_MESSAGES } from '@/constants/errors/domain';
import { ValidationErrorCode, ValidationSeverity } from '@/constants/validation-constants';
import { ValidationError } from '@/types/api/validation';

/**
 * APIバリデーションエラーを表す例外クラス
 *
 * @class ValidationException
 * @extends {Error}
 * @property {string} code - エラーコード
 * @property {ValidationError[]} errors - バリデーションエラーの配列
 * @property {unknown} [originalError] - 元のエラー
 */
export class ValidationException extends Error {
  readonly code: string;
  readonly errors: ValidationError[];
  readonly originalError?: unknown;

  constructor(errors: ValidationError[], originalError?: unknown) {
    super(ERROR_MESSAGES[API_ERROR_CODES.API_VALIDATION_ERROR]);
    this.name = 'ValidationException';
    this.code = API_ERROR_CODES.API_VALIDATION_ERROR;
    this.errors = errors;
    this.originalError = originalError;
  }
}

/**
 * Zodエラーをアプリケーションのバリデーションエラーに変換
 *
 * @param {z.ZodError} error - Zodのバリデーションエラー
 * @returns {ValidationException} 変換されたバリデーション例外
 */
export const handleZodError = (error: z.ZodError): ValidationException => {
  const validationErrors = error.errors.map(
    (err): ValidationError => ({
      code: ValidationErrorCode.INVALID_DATA_FORMAT,
      message: err.message,
      field: err.path.join('.'),
      severity: ValidationSeverity.ERROR,
    })
  );

  return new ValidationException(validationErrors, error);
};

/**
 * APIレスポンスのバリデーションを実行
 *
 * @template T - バリデーション対象のデータ型
 * @param {z.ZodType<T>} schema - バリデーションスキーマ
 * @param {unknown} data - バリデーション対象のデータ
 * @returns {Promise<T>} バリデーション済みのデータ
 * @throws {ValidationException} バリデーションエラーが発生した場合
 */
export const validateApiResponse = async <T>(schema: z.ZodType<T>, data: unknown): Promise<T> => {
  try {
    return await schema.parseAsync(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw handleZodError(error);
    }
    throw new ValidationException(
      [
        {
          code: ValidationErrorCode.INVALID_DATA_FORMAT,
          message: '予期せぬエラーが発生しました',
          field: '',
          severity: ValidationSeverity.ERROR,
        },
      ],
      error
    );
  }
};
