import { describe, it, expect } from 'vitest';
import {
  BaseResponseSchema,
  UniversitiesResponseSchema,
  DepartmentsResponseSchema,
  ErrorResponseSchema,
} from './api-response-schemas';

/**
 * APIレスポンススキーマのテスト
 * 各スキーマのバリデーションが正しく機能することを確認します
 */
describe('APIレスポンススキーマ', () => {
  describe('BaseResponseSchema', () => {
    it('有効な基本レスポンスを検証できること', () => {
      const validResponse = {
        success: true,
        timestamp: Date.now(),
        message: 'Success',
      };

      const result = BaseResponseSchema.safeParse(validResponse);
      expect(result.success).toBe(true);
    });

    it('無効な基本レスポンスを拒否すること', () => {
      const invalidResponse = {
        success: 'true', // 文字列は不可
        timestamp: 'now', // 数値でなければならない
      };

      const result = BaseResponseSchema.safeParse(invalidResponse);
      expect(result.success).toBe(false);
    });
  });

  describe('UniversitiesResponseSchema', () => {
    it('有効な大学一覧レスポンスを検証できること', () => {
      const validResponse = {
        success: true,
        timestamp: Date.now(),
        data: {
          universities: [
            {
              id: 1,
              name: 'テスト大学',
              created_at: '2024-01-01T00:00:00Z',
              updated_at: '2024-01-01T00:00:00Z',
              deleted_at: null,
              version: 1,
              created_by: 'admin',
              updated_by: 'admin',
              departments: [],
            },
          ],
          total: 1,
          page: 1,
          perPage: 10,
        },
      };

      const result = UniversitiesResponseSchema.safeParse(validResponse);
      expect(result.success).toBe(true);
    });
  });

  describe('DepartmentsResponseSchema', () => {
    it('有効な学部一覧レスポンスを検証できること', () => {
      const validResponse = {
        success: true,
        timestamp: Date.now(),
        data: {
          departments: [
            {
              id: 1,
              name: 'テスト学部',
              university_id: 1,
              created_at: '2024-01-01T00:00:00Z',
              updated_at: '2024-01-01T00:00:00Z',
              deleted_at: null,
              version: 1,
              created_by: 'admin',
              updated_by: 'admin',
              majors: [],
            },
          ],
          total: 1,
          page: 1,
          perPage: 10,
        },
      };

      const result = DepartmentsResponseSchema.safeParse(validResponse);
      expect(result.success).toBe(true);
    });
  });

  describe('ErrorResponseSchema', () => {
    it('有効なエラーレスポンスを検証できること', () => {
      const validError = {
        success: false,
        message: 'エラーが発生しました',
        code: 'ERROR_001',
        details: { field: 'name' },
        timestamp: Date.now(),
      };

      const result = ErrorResponseSchema.safeParse(validError);
      expect(result.success).toBe(true);
    });

    it('詳細情報なしのエラーレスポンスを検証できること', () => {
      const validError = {
        success: false,
        message: 'エラーが発生しました',
        code: 'ERROR_001',
        timestamp: Date.now(),
      };

      const result = ErrorResponseSchema.safeParse(validError);
      expect(result.success).toBe(true);
    });
  });
});
