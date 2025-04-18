/**
 * 大学関連のAPIエンドポイントパスを定義
 * 環境変数NEXT_PUBLIC_API_URLを使用してベースURLを設定
 */
export const API_ENDPOINTS = {
  UNIVERSITIES: `${process.env.NEXT_PUBLIC_API_URL}/universities`,
  UNIVERSITY: (universityId: string | number) =>
    `${process.env.NEXT_PUBLIC_API_URL}/universities/${universityId}`,
  DEPARTMENTS: (universityId: number, departmentId: number) =>
    `${process.env.NEXT_PUBLIC_API_URL}/universities/${universityId}/departments/${departmentId}`,
  SUBJECTS_BATCH: (universityId: number, departmentId: number) =>
    `${process.env.NEXT_PUBLIC_API_URL}/universities/${universityId}/departments/${departmentId}/subjects/batch`,
} as const;
