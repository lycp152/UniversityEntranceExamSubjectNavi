/**
 * HTTP関連の型定義
 * HTTPリクエスト・レスポンスの基本型定義を管理
 *
 * @module http-types
 * @description
 * - HTTPメソッドの型定義
 * - HTTPリクエストの設定型定義
 * - HTTPレスポンスの共通型定義
 * - HTTPエラーレスポンスの共通型定義
 */

import { ValidationErrors } from './base-types';

/** HTTPメソッドの型定義 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

/** HTTPリクエストの設定型定義 */
export interface HttpRequestConfig {
  /** HTTPメソッド */
  method: HttpMethod;
  /** HTTPヘッダー（認証トークンなど） */
  headers?: Record<string, string>;
  /** リクエストボディ */
  body?: BodyInit | null;
  /** リクエストのキャンセル信号 */
  signal?: AbortSignal;
}

/**
 * HTTPレスポンスの共通型定義
 * @template T - レスポンスデータの型
 */
export interface HttpResponse<T> {
  /** レスポンスデータ */
  data: T;
  /** HTTPステータスコード */
  status: number;
  /** レスポンスメッセージ */
  message?: string;
  /** HTTPステータスコード（詳細） */
  httpStatus: number;
  /** レスポンスヘッダー */
  headers?: Record<string, string>;
}

/**
 * HTTPエラーレスポンスの共通型定義
 */
export interface HttpError {
  /** エラーコード */
  code: string;
  /** エラーメッセージ */
  message: string;
  /** HTTPステータスコード */
  status: number;
  /** バリデーションエラー情報 */
  validationErrors?: ValidationErrors;
  /** エラー詳細情報 */
  details?: Record<string, unknown>;
}
