/**
 * APIの基本設定とエンドポイント定義
 * バックエンドのAPIエンドポイントと同期を保つ必要があります
 * @see back/internal/api/routes/routes.go
 */

/** APIのベースURL */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * APIエンドポイントの定義
 * 各エンドポイントはバックエンドのルーティングと一致する必要があります
 */
export const API_ENDPOINTS = {
  /** 大学一覧を取得するエンドポイント */
  UNIVERSITIES: `${API_BASE_URL}/api/universities`,
  /** 学部情報を取得するエンドポイント */
  DEPARTMENTS: (universityId: number, departmentId: number) =>
    `${API_BASE_URL}/api/universities/${universityId}/departments/${departmentId}`,
  /** 科目情報を一括取得するエンドポイント */
  SUBJECTS_BATCH: (universityId: number, departmentId: number) =>
    `${API_BASE_URL}/api/universities/${universityId}/departments/${departmentId}/subjects/batch`,
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
