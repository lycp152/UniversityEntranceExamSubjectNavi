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
import {
  ValidationErrorCode,
  ValidationSeverity,
} from '@/features/search/utils/validation-constants';
import { ValidationError } from '@/features/search/types/validation';

/**
 * APIバリデーションエラーを表す例外クラス
 *
 * @class ValidationException
 * @extends {Error}
 * @property {string} code - エラーコード
 * @property {ValidationError[]} errors - バリデーションエラーの配列
 */
export class ValidationException extends Error {
  readonly code: string;
  readonly errors: ValidationError[];

  constructor(errors: ValidationError[]) {
    super(ERROR_MESSAGES[API_ERROR_CODES.API_VALIDATION_ERROR]);
    this.name = 'ValidationException';
    this.code = API_ERROR_CODES.API_VALIDATION_ERROR;
    this.errors = errors;
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

  return new ValidationException(validationErrors);
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
    throw error;
  }
};
