/**
 * 管理画面で使用するAPIエンドポイントの定義
 *
 * @remarks
 * - 環境変数NEXT_PUBLIC_API_URLを使用してAPIのベースURLを設定
 * - 各エンドポイントは必要なパラメータを受け取り、完全なURLを生成
 * - as constを使用して型安全性を確保
 *
 * @example
 * ```typescript
 * const url = API_ENDPOINTS.DEPARTMENTS(1, 2);
 * // => "http://api.example.com/universities/1/departments/2"
 * ```
 */
export const API_ENDPOINTS = {
  UNIVERSITIES: `${process.env.NEXT_PUBLIC_API_URL}/universities`,
  DEPARTMENTS: (universityId: number, departmentId: number) =>
    `${process.env.NEXT_PUBLIC_API_URL}/universities/${universityId}/departments/${departmentId}`,
  SUBJECTS_BATCH: (universityId: number, departmentId: number) =>
    `${process.env.NEXT_PUBLIC_API_URL}/universities/${universityId}/departments/${departmentId}/subjects/batch`,
} as const;
