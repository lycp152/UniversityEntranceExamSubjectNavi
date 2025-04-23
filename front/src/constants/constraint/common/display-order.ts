/**
 * 表示順序の制約値
 * バックエンドの制約値と同期を保つ必要があります
 * @see back/internal/domain/models/models.go
 */
export const DISPLAY_ORDER_CONSTRAINTS = {
  /** 表示順序の最小値 */
  MIN: 0,
  /** 表示順序の最大値 */
  MAX: 999,
  /** デフォルトの表示順序 */
  DEFAULT: 0,
} as const;

/** 表示順序の型定義 */
export type DisplayOrder =
  | typeof DISPLAY_ORDER_CONSTRAINTS.MIN
  | typeof DISPLAY_ORDER_CONSTRAINTS.MAX;
