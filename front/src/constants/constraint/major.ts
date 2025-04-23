/**
 * 学科名の制約値
 * バックエンドの制約値と同期を保つ必要があります
 * @see back/internal/domain/models/models.go
 */
export const MAJOR_CONSTRAINTS = {
  /** 学科名の最大長（バックエンドと一致） */
  MAX_LENGTH: 20,
  /** 学科名の最小長（バックエンドと一致） */
  MIN_LENGTH: 1,
} as const;
