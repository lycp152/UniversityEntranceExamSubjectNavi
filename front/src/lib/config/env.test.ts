/**
 * 環境変数の設定と検証のテストスイート
 *
 * @module env.test
 * @description
 * - 環境変数の設定値の検証
 * - バリデーションルールのテスト
 * - 環境判定フラグのテスト
 * - APIとAUTH設定のテスト
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { loadEnvConfig } from '@next/env';
import { env, ENV } from './env';

describe('環境変数の設定と検証', () => {
  const originalEnv = process.env;
  const projectDir = process.cwd();

  beforeEach(() => {
    vi.resetModules();
    // テスト環境用の環境変数をロード
    const result = loadEnvConfig(projectDir, true);
    if (!result.loadedEnvFiles.length) {
      throw new Error('.env.testファイルが読み込まれませんでした');
    }
    process.env = {
      ...result.combinedEnv,
      NODE_ENV: 'test', // NODE_ENVは必須のため、明示的に設定
    };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.resetModules();
  });

  describe('認証設定', () => {
    it('認証トークンの設定が正しい', () => {
      expect(ENV.AUTH.TOKEN_KEY).toBe(process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY);
      expect(ENV.AUTH.TOKEN_PREFIX).toBe(process.env.NEXT_PUBLIC_AUTH_TOKEN_PREFIX);
      expect(ENV.AUTH.TOKEN_EXPIRE).toBe(Number(process.env.NEXT_PUBLIC_AUTH_TOKEN_EXPIRE));
    });

    it('.env.testファイルの設定が正しく読み込まれる', () => {
      expect(process.env.NEXT_PUBLIC_API_URL).toBeDefined();
      expect(process.env.NEXT_PUBLIC_API_URL).toBe('http://localhost:8080/api');
      expect(process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY).toBe('test_auth_token');
    });
  });

  describe('クライアントサイド環境変数', () => {
    it('API URLが正しく設定される', () => {
      expect(env.NEXT_PUBLIC_API_URL).toBe('http://localhost:8080/api');
    });

    it('不正なAPI URLでエラーがスローされる', async () => {
      const invalidUrl = 'invalid-url';
      process.env.NEXT_PUBLIC_API_URL = invalidUrl;
      try {
        await import('./env');
        throw new Error('環境変数の検証に失敗しました');
      } catch (error: unknown) {
        if (error instanceof Error) {
          expect(error.message).toContain('Invalid environment variables');
        }
      }
    });

    it('API URLが空の場合にエラーがスローされる', async () => {
      process.env.NEXT_PUBLIC_API_URL = '';
      try {
        await import('./env');
        throw new Error('環境変数の検証に失敗しました');
      } catch (error: unknown) {
        if (error instanceof Error) {
          expect(error.message).toContain('Invalid environment variables');
        }
      }
    });
  });

  describe('API設定', () => {
    it('APIのタイムアウト設定が正しい', () => {
      expect(ENV.API.TIMEOUT).toBe(Number(process.env.TEST_TIMEOUT));
    });

    it('クエリ設定のデフォルト値が正しい', () => {
      expect(ENV.API.QUERY.REFETCH_ON_WINDOW_FOCUS).toBe(false);
      expect(ENV.API.QUERY.REFETCH_ON_RECONNECT).toBe(false);
      expect(ENV.API.QUERY.MAX_RETRY_COUNT).toBe(3);
      expect(ENV.API.QUERY.MAX_RETRY_DELAY).toBe(Number(process.env.TEST_TIMEOUT));
    });

    it('リトライ遅延の計算が正しく動作する', () => {
      const delay = ENV.API.QUERY.getRetryDelay(1);
      expect(delay).toBeLessThanOrEqual(Number(process.env.TEST_TIMEOUT));
      expect(delay).toBeGreaterThan(0);
    });

    it('エラー時のリトライロジックが正しく動作する', () => {
      const retryLogic = ENV.API.QUERY.DEFAULT_OPTIONS.RETRY;
      expect(retryLogic(0, new Error())).toBe(true);
      expect(retryLogic(3, new Error())).toBe(false);
    });
  });

  describe('認証設定', () => {
    it('認証トークンの設定が正しい', () => {
      expect(ENV.AUTH.TOKEN_KEY).toBe(process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY);
      expect(ENV.AUTH.TOKEN_PREFIX).toBe(process.env.NEXT_PUBLIC_AUTH_TOKEN_PREFIX);
      expect(ENV.AUTH.TOKEN_EXPIRE).toBe(Number(process.env.NEXT_PUBLIC_AUTH_TOKEN_EXPIRE));
    });

    it('認証トークンの有効期限が正の整数である', () => {
      expect(Number.isInteger(ENV.AUTH.TOKEN_EXPIRE)).toBe(true);
      expect(ENV.AUTH.TOKEN_EXPIRE).toBeGreaterThan(0);
    });
  });
});
