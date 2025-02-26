/**
 * バリデーションルールの定数
 */
export const VALIDATION_RULES = {
  NAME: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 100,
    PATTERN: /^[\p{L}\p{N}\s-]+$/u,
  },
  ENROLLMENT: {
    MIN: 1,
    MAX: 1000,
  },
} as const;

/**
 * エラーコードの定数
 */
export const ERROR_CODES = {
  INVALID_NAME: 'INVALID_NAME',
  INVALID_ENROLLMENT: 'INVALID_ENROLLMENT',
  NOT_FOUND: 'NOT_FOUND',
  SERVER_ERROR: 'SERVER_ERROR',
} as const;
