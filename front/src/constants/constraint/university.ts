/**
 * 大学名の制約値
 * バックエンドの制約値と同期を保つ必要があります
 * @see back/internal/domain/models/models.go
 */
export const UNIVERSITY_CONSTRAINTS = {
  /** 大学名の最小文字数 */
  MIN_LENGTH: 1,
  /** 大学名の最大文字数 */
  MAX_LENGTH: 20,
} as const;

/** 大学名の型定義 */
export type UniversityName = string & {
  readonly __brand: unique symbol;
};
