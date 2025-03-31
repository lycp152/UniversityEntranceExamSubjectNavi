/**
 * Zodバリデーションルールの定義
 * アプリケーション全体で使用される共通のZodバリデーションルールを提供
 *
 * @module zod-rules
 * @description
 * - 文字列バリデーションルール
 * - 数値バリデーションルール
 * - URLバリデーションルール
 * - 日付バリデーションルール
 * - その他の共通バリデーションルール
 */

import { z } from 'zod';

/**
 * 共通のバリデーションルールを定義するオブジェクト
 *
 * @constant {Object} commonRules
 * @property {Object} string - 文字列バリデーションルール
 * @property {Object} number - 数値バリデーションルール
 * @property {Function} url - URLバリデーションルール
 * @property {Function} date - 日付バリデーションルール
 * @property {Function} optional - オプショナルフィールド用ルール
 * @property {Function} array - 配列バリデーションルール
 * @property {Function} enum - 列挙型バリデーションルール
 */
export const commonRules = {
  // 文字列の最小・最大長
  string: {
    min: (min: number, message: string) => z.string().min(min, message),
    max: (max: number, message: string) => z.string().max(max, message),
    minMax: (min: number, max: number, message: string) =>
      z.string().min(min, message).max(max, message),
  },
  // 数値の範囲
  number: {
    min: (min: number, message: string) => z.number().min(min, message),
    max: (max: number, message: string) => z.number().max(max, message),
    minMax: (min: number, max: number, message: string) =>
      z.number().min(min, message).max(max, message),
  },
  // URL
  url: (message: string) => z.string().url(message),
  // 日付
  date: (message: string) => z.string().datetime(message),
  // オプショナル
  optional: <T extends z.ZodType>(schema: T) => schema.optional(),
  // 配列
  array: <T extends z.ZodType>(schema: T) => z.array(schema),
  // 列挙型
  enum: <T extends [string, ...string[]]>(values: T, message: string) =>
    z.enum(values, { errorMap: () => ({ message }) }),
} as const;
