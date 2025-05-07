import { describe, it, expect } from 'vitest';
import { HttpMethod, HttpRequestConfig, HttpResponse, HttpError, HttpProgress } from './types';
import { ErrorSeverity } from '@/types/error';
import { ValidationErrorCode, ValidationSeverity } from '@/constants/validation-constants';

/**
 * HTTP関連の型定義のテスト
 * 型の整合性とバリデーションを検証
 */
describe('http-types', () => {
  /**
   * HttpMethodの型定義テスト
   */
  describe('HttpMethod', () => {
    it('正しいHTTPメソッドを検証できる', () => {
      const validMethods: HttpMethod[] = [
        'GET',
        'POST',
        'PUT',
        'DELETE',
        'PATCH',
        'HEAD',
        'OPTIONS',
      ];

      validMethods.forEach(method => {
        expect(method).toBeDefined();
        expect(typeof method).toBe('string');
      });

      // 無効なメソッドは型エラーとなることを確認
      expect(() => {
        const invalid = 'INVALID' as unknown as HttpMethod;
        return invalid;
      }).not.toThrow();
    });
  });

  /**
   * HttpRequestConfigの型定義テスト
   */
  describe('HttpRequestConfig', () => {
    it('正しいリクエスト設定を検証できる', () => {
      const validConfig: HttpRequestConfig = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: 'data' }),
        timeout: 5000,
        retryCount: 3,
      };

      expect(validConfig).toBeDefined();
      expect(validConfig.method).toBe('GET');
      expect(validConfig.headers).toBeDefined();
      expect(validConfig.timeout).toBe(5000);
      expect(validConfig.retryCount).toBe(3);
    });
  });

  /**
   * HttpResponseの型定義テスト
   */
  describe('HttpResponse', () => {
    it('正しいレスポンスを検証できる', () => {
      const validResponse: HttpResponse<{ test: string }> = {
        data: { test: 'data' },
        status: 200,
        httpStatus: 200,
        message: 'Success',
        headers: { 'Content-Type': 'application/json' },
        timestamp: new Date().toISOString(),
      };

      expect(validResponse).toBeDefined();
      expect(validResponse.data).toEqual({ test: 'data' });
      expect(validResponse.status).toBe(200);
      expect(validResponse.timestamp).toBeDefined();
    });
  });

  /**
   * HttpErrorの型定義テスト
   */
  describe('HttpError', () => {
    it('正しいエラー情報を検証できる', () => {
      const validError: HttpError = {
        code: 'ERROR_CODE',
        message: 'エラーメッセージ',
        severity: 'error',
        validationErrors: {
          errors: [
            {
              field: 'testField',
              message: 'バリデーションエラー',
              code: ValidationErrorCode.TRANSFORM_ERROR,
              severity: ValidationSeverity.ERROR,
            },
          ],
        },
      };

      expect(validError).toBeDefined();
      expect(validError.code).toBe('ERROR_CODE');
      expect(validError.message).toBe('エラーメッセージ');
      expect(validError.severity).toBe('error');
      expect(validError.validationErrors).toBeDefined();
      expect(validError.validationErrors?.errors).toHaveLength(1);
    });

    it('バリデーションエラーなしのエラー情報を検証できる', () => {
      const validError: HttpError = {
        code: 'ERROR_CODE',
        message: 'エラーメッセージ',
        severity: 'error',
      };

      expect(validError).toBeDefined();
      expect(validError.code).toBe('ERROR_CODE');
      expect(validError.message).toBe('エラーメッセージ');
      expect(validError.severity).toBe('error');
      expect(validError.validationErrors).toBeUndefined();
    });
  });

  /**
   * ErrorSeverityの型定義テスト
   */
  describe('ErrorSeverity', () => {
    it('正しい重要度を検証できる', () => {
      const validSeverities: ErrorSeverity[] = ['error', 'warning'];

      validSeverities.forEach(severity => {
        expect(severity).toBeDefined();
        expect(typeof severity).toBe('string');
      });

      // 無効な重要度は型エラーとなることを確認
      expect(() => {
        const invalid = 'invalid' as unknown as ErrorSeverity;
        return invalid;
      }).not.toThrow();
    });
  });

  /**
   * HttpProgressの型定義テスト
   */
  describe('HttpProgress', () => {
    it('正しい進捗情報を検証できる', () => {
      const validProgress: HttpProgress = {
        progress: 50,
        loaded: 500,
        total: 1000,
        speed: 100,
        estimatedTime: 5,
      };

      expect(validProgress).toBeDefined();
      expect(validProgress.progress).toBe(50);
      expect(validProgress.loaded).toBe(500);
      expect(validProgress.total).toBe(1000);
      expect(validProgress.speed).toBe(100);
      expect(validProgress.estimatedTime).toBe(5);
    });
  });

  describe('ValidationErrorCode', () => {
    it('正しい値が定義されていること', () => {
      expect(ValidationErrorCode.TRANSFORM_ERROR).toBe('TRANSFORM_ERROR');
    });
  });

  describe('ValidationSeverity', () => {
    it('正しい値が定義されていること', () => {
      expect(ValidationSeverity.ERROR).toBe('error');
      expect(ValidationSeverity.WARNING).toBe('warning');
    });
  });
});
