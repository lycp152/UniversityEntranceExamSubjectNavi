/**
 * APIレスポンスのスキーマ定義
 * Zodを使用したAPIレスポンスの型検証スキーマを定義
 *
 * @module api-response-schemas
 * @description
 * - 基本的なレスポンススキーマ
 * - 大学一覧のレスポンススキーマ
 * - 学部一覧のレスポンススキーマ
 * - エラーレスポンスのスキーマ
 */

import { z } from 'zod';
import { UniversitySchema, DepartmentSchema } from '@/types/api/schemas';

/** 基本的なレスポンススキーマ */
export const BaseResponseSchema = z.object({
  /** 処理の成功/失敗 */
  success: z.boolean(),
  /** レスポンス生成時のタイムスタンプ */
  timestamp: z.number(),
  /** レスポンスメッセージ */
  message: z.string().optional(),
});

/** 大学一覧のレスポンススキーマ */
export const UniversitiesResponseSchema = BaseResponseSchema.extend({
  /** レスポンスデータ */
  data: z.object({
    /** 大学情報の配列 */
    universities: z.array(UniversitySchema),
    /** 総件数 */
    total: z.number(),
    /** 現在のページ番号 */
    page: z.number(),
    /** 1ページあたりの件数 */
    perPage: z.number(),
  }),
});

/** 学部一覧のレスポンススキーマ */
export const DepartmentsResponseSchema = BaseResponseSchema.extend({
  /** レスポンスデータ */
  data: z.object({
    /** 学部情報の配列 */
    departments: z.array(DepartmentSchema),
    /** 総件数 */
    total: z.number(),
    /** 現在のページ番号 */
    page: z.number(),
    /** 1ページあたりの件数 */
    perPage: z.number(),
  }),
});

/** エラーレスポンスのスキーマ */
export const ErrorResponseSchema = z.object({
  /** 処理の失敗を示すフラグ */
  success: z.literal(false),
  /** エラーメッセージ */
  message: z.string(),
  /** エラーコード */
  code: z.string(),
  /** エラー詳細情報 */
  details: z.record(z.unknown()).optional(),
  /** エラー発生時のタイムスタンプ */
  timestamp: z.number(),
});

/** 基本的なレスポンスの型定義 */
export type BaseResponse = z.infer<typeof BaseResponseSchema>;
/** 大学一覧レスポンスの型定義 */
export type UniversitiesResponse = z.infer<typeof UniversitiesResponseSchema>;
/** 学部一覧レスポンスの型定義 */
export type DepartmentsResponse = z.infer<typeof DepartmentsResponseSchema>;
/** エラーレスポンスの型定義 */
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
