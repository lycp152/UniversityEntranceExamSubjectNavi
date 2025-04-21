/**
 * APIエラーの基底クラスのテストスイート
 *
 * @module base.test
 * @description
 * BaseApiErrorクラスの機能をテストします。
 * - エラーの基本プロパティ
 * - カスタムエラー詳細
 * - デフォルト値の動作
 * - 型安全性の検証
 */

import { describe, it, expect } from 'vitest';
import { BaseApiError } from './base';

describe('BaseApiError', () => {
  describe('基本的な機能', () => {
    it('基本的なエラープロパティが正しく設定される', () => {
      const error = new BaseApiError({
        code: 'TEST_ERROR',
        message: 'テストエラー',
        status: 400,
      });

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(BaseApiError);
      expect(error.code).toBe('TEST_ERROR');
      expect(error.message).toBe('テストエラー');
      expect(error.status).toBe(400);
      expect(error.name).toBe('BaseApiError');
    });

    it('スタックトレースが保持される', () => {
      const error = new BaseApiError({
        code: 'STACK_TEST',
        message: 'スタックテスト',
      });

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('スタックテスト');
      expect(error.stack).toContain('BaseApiError');
      expect(error.stack?.split('\n')[0]).toBe('BaseApiError: スタックテスト');
    });
  });

  describe('デフォルト値と省略可能なプロパティ', () => {
    it('statusが省略された場合、デフォルト値の500が設定される', () => {
      const error = new BaseApiError({
        code: 'DEFAULT_STATUS',
        message: 'ステータスコード省略',
      });

      expect(error.status).toBe(500);
    });

    it('detailsが省略された場合、undefinedが設定される', () => {
      const error = new BaseApiError({
        code: 'NO_DETAILS',
        message: '詳細情報なし',
      });

      expect(error.details).toBeUndefined();
    });
  });

  describe('エラー詳細情報', () => {
    it('追加の詳細情報が正しく設定される', () => {
      const details = {
        field: 'username',
        reason: 'duplicate',
        timestamp: new Date().toISOString(),
      };

      const error = new BaseApiError({
        code: 'VALIDATION_ERROR',
        message: 'バリデーションエラー',
        status: 422,
        details,
      });

      expect(error.details).toEqual(details);
      if (error.details) {
        expect(error.details['field']).toBe('username');
        expect(error.details['reason']).toBe('duplicate');
      }
    });

    it('ネストされた詳細情報が正しく処理される', () => {
      type ValidationDetails = {
        validation: {
          field: string;
          errors: string[];
        };
        context: {
          requestId: string;
          timestamp: string;
        };
      };

      const nestedDetails: ValidationDetails = {
        validation: {
          field: 'email',
          errors: ['形式が不正', '既に使用されています'],
        },
        context: {
          requestId: '123',
          timestamp: new Date().toISOString(),
        },
      };

      const error = new BaseApiError({
        code: 'NESTED_ERROR',
        message: 'ネストされたエラー',
        details: nestedDetails,
      });

      expect(error.details).toEqual(nestedDetails);
      if (error.details) {
        const details = error.details as ValidationDetails;
        expect(details.validation.errors).toHaveLength(2);
        expect(details.context.requestId).toBe('123');
      }
    });
  });

  describe('エラーチェーン', () => {
    it('元のエラーが正しくチェーンされる', () => {
      const originalError = new Error('元のエラー');
      const apiError = new BaseApiError({
        code: 'CHAINED_ERROR',
        message: 'チェーンされたエラー',
        details: { originalError },
      });

      if (apiError.details) {
        const details = apiError.details as { originalError: Error };
        expect(details.originalError).toBe(originalError);
        expect(details.originalError.message).toBe('元のエラー');
      }
    });

    it('複数のエラーがチェーンされる場合も正しく処理される', () => {
      const firstError = new Error('最初のエラー');
      const secondError = new BaseApiError({
        code: 'SECOND_ERROR',
        message: '2番目のエラー',
        details: { cause: firstError },
      });
      const finalError = new BaseApiError({
        code: 'FINAL_ERROR',
        message: '最終エラー',
        details: { previousError: secondError },
      });

      if (finalError.details) {
        const details = finalError.details as { previousError: BaseApiError };
        expect(details.previousError).toBe(secondError);
        if (details.previousError.details) {
          const prevDetails = details.previousError.details as { cause: Error };
          expect(prevDetails.cause).toBe(firstError);
        }
      }
    });
  });

  describe('型安全性', () => {
    it('readonlyプロパティの変更が防止される', () => {
      const error = new BaseApiError({
        code: 'READONLY_TEST',
        message: 'readonly テスト',
      });

      // TypeScriptの型チェックのみを目的とした静的解析用のコード
      // 実行時には評価されない
      // @ts-expect-error
      error.code = 'NEW_CODE';
      // @ts-expect-error
      error.status = 404;
    });

    it('必須プロパティの検証', () => {
      // @ts-expect-error - TypeScriptの型チェックエラーを期待
      expect(() => new BaseApiError({ message: 'コード欠落' })).toThrow(TypeError);

      // @ts-expect-error - TypeScriptの型チェックエラーを期待
      expect(() => new BaseApiError({ code: 'NO_MESSAGE' })).toThrow(TypeError);
    });
  });
});
