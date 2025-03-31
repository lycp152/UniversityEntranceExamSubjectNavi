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
 * @property {Object} CACHE - キャッシュ関連の設定
 * @property {Object} RETRY - リトライ関連の設定
 */

export const ENV = {
  /** API関連の設定 */
  API: {
    /** APIのベースURL（環境変数から取得） */
    BASE_URL: process.env.NEXT_PUBLIC_BASE_API_URL ?? '',
    /** APIリクエストのタイムアウト時間（ミリ秒） */
    TIMEOUT: 30000,
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
  /** キャッシュ関連の設定 */
  CACHE: {
    /** キャッシュの有効期限（ミリ秒） */
    STALE_TIME: 1000 * 60 * 5, // 5分
    /** キャッシュの保持期間（ミリ秒） */
    GC_TIME: 1000 * 60 * 60 * 24, // 24時間
  },
  /** リトライ関連の設定 */
  RETRY: {
    /** リトライ回数 */
    COUNT: 1,
    /** リトライ間隔（ミリ秒） */
    DELAY: 1000,
  },
} as const;
