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
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

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
  /** リクエストのタイムアウト時間（ミリ秒） */
  timeout?: number;
  /** リクエストの再試行回数 */
  retryCount?: number;
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
  /** レスポンスのタイムスタンプ */
  timestamp: string;
}

/**
 * HTTPエラーの重要度の型定義
 */
export type ErrorSeverity = 'error' | 'warning' | 'info';

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
  /** エラーの重要度 */
  severity: ErrorSeverity;
  /** バリデーションエラー情報 */
  validationErrors?: ValidationErrors;
  /** エラー詳細情報 */
  details?: Record<string, unknown>;
  /** エラーのタイムスタンプ */
  timestamp: string;
  /** エラーのスタックトレース */
  stack?: string;
}

/**
 * HTTPリクエストの進捗状況を表す型定義
 */
export interface HttpProgress {
  /** 進捗率（0-100） */
  progress: number;
  /** 転送済みバイト数 */
  loaded: number;
  /** 合計バイト数 */
  total: number;
  /** 転送速度（バイト/秒） */
  speed: number;
  /** 推定残り時間（秒） */
  estimatedTime: number;
}
