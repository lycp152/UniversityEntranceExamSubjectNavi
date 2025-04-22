/**
 * APIレスポンスの型定義
 * APIからのレスポンスデータの型定義を管理
 * バックエンドのAPIエンドポイントと同期を保つ必要があります
 * HTTP関連の型定義
 * HTTPリクエスト・レスポンスの基本型定義を管理
 * バックエンドのAPIエンドポイントと同期を保つ必要があります
 * @see back/internal/server/routes.go
 * @see back/internal/errors/http_error.go
 *
 * @module types
 * @description
 * - 大学一覧取得APIのレスポンス型
 * - 基本的なモデル型定義
 * - 各エンティティのAPIレスポンス型
 * - HTTPメソッドの型定義
 * - HTTPリクエストの設定型定義
 * - HTTPレスポンスの共通型定義
 * - HTTPエラーレスポンスの共通型定義
 */

import { ValidationErrors } from './base-model';
import { ErrorSeverity } from '@/types/error';
import {
  University,
  Department,
  Major,
  AdmissionSchedule,
  AdmissionInfo,
  TestType,
  Subject,
} from './schemas';
import { BaseModel } from './base-model';

/**
 * 大学一覧取得APIのレスポンス型
 */
export interface GetUniversitiesResponse
  extends HttpResponse<{
    /** 大学情報の配列 */
    universities: University[];
    /** 総件数 */
    total: number;
    /** 現在のページ番号 */
    page: number;
    /** 1ページあたりの件数 */
    limit: number;
  }> {}

/** 大学情報のAPIレスポンス型 */
export type APIUniversity = University & BaseModel;
/** 学部情報のAPIレスポンス型 */
export type APIDepartment = Department & BaseModel;
/** 学科情報のAPIレスポンス型 */
export type APIMajor = Major & BaseModel;
/** 入試スケジュールのAPIレスポンス型 */
export type APIAdmissionSchedule = AdmissionSchedule & BaseModel;
/** 入試情報のAPIレスポンス型 */
export type APIAdmissionInfo = AdmissionInfo & BaseModel;
/** 試験種別のAPIレスポンス型 */
export type APITestType = TestType & BaseModel;
/** 科目情報のAPIレスポンス型 */
export type APISubject = Subject & BaseModel;

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
 * HTTPエラーレスポンスの共通型定義
 */
export interface HttpError {
  /** エラーコード */
  code: string;
  /** エラーメッセージ */
  message: string;
  /** エラーの重要度 */
  severity: ErrorSeverity;
  /** バリデーションエラー情報 */
  validationErrors?: ValidationErrors;
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
