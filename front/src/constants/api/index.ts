// APIのベースURL
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// APIエンドポイントの定義
export const API_ENDPOINTS = {
  // 大学一覧を取得するエンドポイント
  UNIVERSITIES: `${API_BASE_URL}/api/universities`,
  // 学部情報を取得するエンドポイント
  DEPARTMENTS: (universityId: number, departmentId: number) =>
    `${API_BASE_URL}/api/universities/${universityId}/departments/${departmentId}`,
  // 科目情報を一括取得するエンドポイント
  SUBJECTS_BATCH: (universityId: number, departmentId: number) =>
    `${API_BASE_URL}/api/universities/${universityId}/departments/${departmentId}/subjects/batch`,
} as const;

// APIリクエストのデフォルトヘッダー
export const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
  "Cache-Control": "no-cache",
  Pragma: "no-cache",
} as const;
