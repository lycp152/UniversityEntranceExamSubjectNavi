/**
 * 環境変数の設定と検証を行うモジュール
 * @t3-oss/env-nextjsを使用して型安全な環境変数の管理を実現
 *
 * @module env
 * @description
 * - クライアントサイド環境変数の定義と検証
 * - サーバーサイド環境変数の定義と検証
 * - 環境変数の型安全性の確保
 * - カスタムバリデーションルールの実装
 */

import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';
import { BaseApiError } from '@/lib/api/errors/base';

/**
 * 環境変数の設定と検証を行うオブジェクト
 * @constant {Object} env
 * @property {Object} client - クライアントサイド環境変数の定義
 * @property {Object} server - サーバーサイド環境変数の定義
 * @property {Object} runtimeEnv - 実行時環境変数の設定
 * @property {boolean} skipValidation - バリデーションスキップフラグ
 * @property {boolean} emptyStringAsUndefined - 空文字列をundefinedとして扱うフラグ
 */
export const env = createEnv({
  client: {
    NEXT_PUBLIC_API_URL: z
      .string()
      .url({ message: 'APIのURLが正しい形式ではありません' })
      .min(1, { message: 'APIのURLは必須です' })
      .refine(url => url.startsWith('http'), {
        message: 'APIのURLはhttpまたはhttpsで始まる必要があります',
      }),
  },
  server: {
    NODE_ENV: z
      .enum(['development', 'production', 'test'], {
        errorMap: () => ({
          message: '環境はdevelopment、production、testのいずれかである必要があります',
        }),
      })
      .default('development'),
  },
  runtimeEnv: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NODE_ENV: process.env.NODE_ENV,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});

/** 本番環境かどうかを示すフラグ */
export const isProduction = process.env.NODE_ENV === 'production';

/** 開発環境かどうかを示すフラグ */
export const isDevelopment = process.env.NODE_ENV === 'development';

/** テスト環境かどうかを示すフラグ */
export const isTest = process.env.NODE_ENV === 'test';

/** 開発環境でのデバッグツールの表示制御 */
export const isDevToolsEnabled =
  isDevelopment && process.env.NEXT_PUBLIC_ENABLE_DEVTOOLS === 'true';

/**
 * アプリケーションの環境設定
 * API、認証、キャッシュ、リトライなどの設定値を定義
 *
 * @module env
 * @description
 * - 環境変数から設定値を取得
 * - 開発、本番、テスト環境の判定
 * - アプリケーション全体で使用される定数の定義
 */

/**
 * アプリケーションの環境設定オブジェクト
 *
 * @constant {Object} ENV
 * @property {Object} API - API関連の設定
 * @property {Object} AUTH - 認証関連の設定
 */

export const ENV = {
  /** API関連の設定 */
  API: {
    /** APIのベースURL（環境変数から取得） */
    BASE_URL: process.env.NEXT_PUBLIC_BASE_API_URL ?? '',
    /** APIリクエストのタイムアウト時間（ミリ秒） */
    TIMEOUT: 30000,
    /** React Queryのグローバル設定 */
    QUERY: {
      /** ウィンドウフォーカス時の自動リフェッチを無効化 */
      REFETCH_ON_WINDOW_FOCUS: false,
      /** ネットワーク再接続時の自動リフェッチを無効化 */
      REFETCH_ON_RECONNECT: false,
      /** リトライの最大回数 */
      MAX_RETRY_COUNT: 3,
      /** リトライ遅延の最大値（ミリ秒） */
      MAX_RETRY_DELAY: 30000,
      /** リトライ遅延の計算関数 */
      getRetryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
      /** キャッシュの有効期限（ミリ秒） */
      STALE_TIME: 1000 * 60 * 5, // 5分
      /** キャッシュの保持期間（ミリ秒） */
      GC_TIME: 1000 * 60 * 60 * 24, // 24時間
      /** クエリのデフォルト設定 */
      DEFAULT_OPTIONS: {
        /** エラー発生時のリトライロジック */
        RETRY: (failureCount: number, error: Error) => {
          if (error instanceof BaseApiError) {
            // 認証エラーや不正なリクエストの場合はリトライしない
            if (error.code === 'UNAUTHORIZED' || error.code === 'BAD_REQUEST') {
              return false;
            }
            // サーバーエラーの場合は3回までリトライ
            if (error.code === 'INTERNAL_SERVER_ERROR') {
              return failureCount < ENV.API.QUERY.MAX_RETRY_COUNT;
            }
            // その他のエラーは1回までリトライ
            return failureCount < 1;
          }
          return failureCount < ENV.API.QUERY.MAX_RETRY_COUNT;
        },
        /** リトライ遅延の計算関数 */
        RETRY_DELAY: (attemptIndex: number) => ENV.API.QUERY.getRetryDelay(attemptIndex),
      },
      /** ミューテーションのデフォルト設定 */
      MUTATION_OPTIONS: {
        /** エラー発生時のリトライロジック */
        RETRY: (failureCount: number, error: Error) => {
          if (error instanceof BaseApiError) {
            // 認証エラーや不正なリクエストの場合はリトライしない
            if (error.code === 'UNAUTHORIZED' || error.code === 'BAD_REQUEST') {
              return false;
            }
            // サーバーエラーの場合は1回までリトライ
            if (error.code === 'INTERNAL_SERVER_ERROR') {
              return failureCount < 1;
            }
            // その他のエラーはリトライしない
            return false;
          }
          return failureCount < 1;
        },
        /** リトライ遅延の計算関数 */
        RETRY_DELAY: (attemptIndex: number) => ENV.API.QUERY.getRetryDelay(attemptIndex),
      },
    },
  },
  /** 認証関連の設定 */
  AUTH: {
    /** 認証トークンを保存するキー名 */
    TOKEN_KEY: process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY ?? 'auth_token',
    /** 認証トークンのプレフィックス（Bearer等） */
    TOKEN_PREFIX: process.env.NEXT_PUBLIC_AUTH_TOKEN_PREFIX ?? 'Bearer',
    /** 認証トークンの有効期限（秒） */
    TOKEN_EXPIRE: Number(process.env.NEXT_PUBLIC_AUTH_TOKEN_EXPIRE ?? 3600),
  },
} as const;
