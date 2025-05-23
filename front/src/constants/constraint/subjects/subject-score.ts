/**
 * 科目スコアの制約値
 * バックエンドの制約値と同期を保つ必要があります
 * @see back/internal/domain/models/models.go
 */
export const SUBJECT_SCORE_CONSTRAINTS = {
  /** スコアの制約（バックエンドと一致） */
  MIN_SCORE: 0,
  MAX_SCORE: 1000,

  /** パーセンテージの制約（バックエンドと一致） */
  MIN_PERCENTAGE: 0,
  MAX_PERCENTAGE: 100,

  /** 表示順の制約（バックエンドと一致） */
  MIN_DISPLAY_ORDER: 0,
  MAX_DISPLAY_ORDER: 999,

  /** 表示用の小数点以下の桁数 */
  DEFAULT_DECIMAL_PLACES: 2,
} as const;

/** スコアの型定義 */
export type Score =
  | typeof SUBJECT_SCORE_CONSTRAINTS.MIN_SCORE
  | typeof SUBJECT_SCORE_CONSTRAINTS.MAX_SCORE;
/** パーセンテージの型定義 */
export type Percentage =
  | typeof SUBJECT_SCORE_CONSTRAINTS.MIN_PERCENTAGE
  | typeof SUBJECT_SCORE_CONSTRAINTS.MAX_PERCENTAGE;
/** 表示順の型定義 */
export type DisplayOrder =
  | typeof SUBJECT_SCORE_CONSTRAINTS.MIN_DISPLAY_ORDER
  | typeof SUBJECT_SCORE_CONSTRAINTS.MAX_DISPLAY_ORDER;
/** 小数点以下の桁数の型定義 */
export type DecimalPlaces = typeof SUBJECT_SCORE_CONSTRAINTS.DEFAULT_DECIMAL_PLACES;
