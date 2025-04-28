/**
 * APIの基本設定とエンドポイント定義
 * バックエンドのAPIエンドポイントと同期を保つ必要があります
 * @see back/internal/middleware/auth.go
 */

/** APIのベースURL */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * 大学関連のAPIエンドポイントの定義
 * 環境変数NEXT_PUBLIC_API_URLを使用してベースURLを設定
 *
 * @remarks
 * - このファイルは大学関連のすべてのAPIエンドポイントを一元管理します
 * - 各エンドポイントは必要なパラメータを受け取り、完全なURLを生成します
 * - as constを使用して型安全性を確保しています
 *
 * @example
 * ```typescript
 * const url = API_ENDPOINTS.DEPARTMENTS(1, 2);
 * // => "http://api.example.com/universities/1/departments/2"
 * ```
 */
export const API_ENDPOINTS = {
  /** 大学一覧を取得するエンドポイント */
  UNIVERSITIES: `${API_BASE_URL}/universities`,
  /** 特定の大学の情報を取得するエンドポイント */
  UNIVERSITY: (universityId: string | number) => `${API_BASE_URL}/universities/${universityId}`,
  /** 学部情報を取得するエンドポイント */
  DEPARTMENTS: (universityId: number, departmentId: number) =>
    `${API_BASE_URL}/universities/${universityId}/departments/${departmentId}`,
  /** 科目情報を一括取得するエンドポイント */
  SUBJECTS_BATCH: (universityId: number, departmentId: number) =>
    `${API_BASE_URL}/universities/${universityId}/departments/${departmentId}/subjects/batch`,
  /** 学科情報を取得するエンドポイント */
  MAJOR: (departmentId: number, majorId: number) =>
    `${API_BASE_URL}/departments/${departmentId}/majors/${majorId}`,
  /** 入試日程情報を取得するエンドポイント */
  ADMISSION_SCHEDULE: (majorId: number, scheduleId: number) =>
    `${API_BASE_URL}/majors/${majorId}/schedules/${scheduleId}`,
  /** 入試情報を取得するエンドポイント */
  ADMISSION_INFO: (scheduleId: number, infoId: number) =>
    `${API_BASE_URL}/schedules/${scheduleId}/info/${infoId}`,
} as const;

/**
 * APIリクエストのデフォルトヘッダー
 * キャッシュ制御とコンテンツタイプを設定
 */
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-cache',
  Pragma: 'no-cache',
} as const;
