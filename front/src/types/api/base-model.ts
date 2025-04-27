/**
 * 基本モデルの型定義
 * 全てのモデルの基底となる共通の型定義を管理
 * APIの基本型定義
 * 共通で使用される基本的な型定義を管理
 * バックエンドのAPIエンドポイントと同期を保つ必要があります
 * @see back/internal/domain/models/models.go
 *
 * @module base-model
 * @description
 * - モデルの基本情報の型定義
 * - バージョン管理の型定義
 * - 作成・更新情報の型定義
 * - バリデーション関連の型定義
 * - 基本的なデータ型の定義
 */

import { ValidationError } from '@/types/api/validation';

/** 全てのモデルの基底となる型 */
export interface BaseModel {
  /** モデルID（一意の識別子） */
  id: number;
  /** バージョン番号（楽観的ロック用） */
  version: number;
  /** 作成日時（ISO 8601形式のUTC日時） */
  createdAt: string;
  /** 更新日時（ISO 8601形式のUTC日時） */
  updatedAt: string;
  /** 削除日時（論理削除用、ISO 8601形式のUTC日時） */
  deletedAt?: string | null;
  /** 作成者のユーザーID */
  createdBy: string;
  /** 更新者のユーザーID */
  updatedBy: string;
}

/**
 * バリデーションエラーの集合型定義
 */
export interface ValidationErrors {
  /** バリデーションエラーの配列 */
  errors: ValidationError[];
}
