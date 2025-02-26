/**
 * 全てのモデルの基底となる型定義
 */
export interface BaseModel {
  id: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}
