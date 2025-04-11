/**
 * APIの基本型定義
 * 共通で使用される基本的な型定義を管理
 *
 * @module base-types
 * @description
 * - 基本モデルの型定義
 * - 共通のバリデーションルール
 * - 基本的なデータ型の定義
 */

/**
 * 基本モデルの型定義
 * すべてのエンティティが継承する基本型
 */
export interface BaseModel {
  /** エンティティの一意の識別子 */
  id: number;
  /** レコードの作成日時 */
  created_at: string;
  /** レコードの更新日時 */
  updated_at: string;
  /** レコードの削除日時 */
  deleted_at: string | null;
  /** レコードのバージョン（楽観的ロック用） */
  version: number;
  /** レコードの作成者ID */
  created_by: string;
  /** レコードの更新者ID */
  updated_by: string;
}

/**
 * バリデーションエラーの型定義
 */
export interface ValidationError {
  /** エラーが発生したフィールド名 */
  field: string;
  /** エラーメッセージ */
  message: string;
  /** エラーコード */
  code: string;
  /** エラーの重要度 */
  severity: 'error' | 'warning' | 'info';
}

/**
 * バリデーションエラーの集合型定義
 */
export interface ValidationErrors {
  /** バリデーションエラーの配列 */
  errors: ValidationError[];
}

/**
 * バリデーションルールの型定義
 */
export interface ValidationRule<T> {
  /** バリデーション対象のフィールド名 */
  field: string;
  /** バリデーション条件 */
  condition: (value: T) => boolean;
  /** エラーメッセージ */
  message: string;
  /** エラーコード */
  code: string;
}
