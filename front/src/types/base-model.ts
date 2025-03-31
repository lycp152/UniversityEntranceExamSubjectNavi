/**
 * 全てのモデルの基底となる型定義
 */
export interface BaseModel {
  id: number;
  version: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  createdBy: string;
  updatedBy: string;
}
