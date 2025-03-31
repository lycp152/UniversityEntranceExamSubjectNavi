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
