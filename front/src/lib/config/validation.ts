/**
 * バリデーション失敗の種類
 */
export const enum ValidationFailureType {
  INVALID_FORMAT = 'INVALID_FORMAT',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  CACHE_ERROR = 'CACHE_ERROR',
  CONCURRENT_ERROR = 'CONCURRENT_ERROR',
}

/**
 * スコアの制約定数
 */
export const SCORE_CONSTRAINTS = {
  MIN_VALUE: 0,
  MAX_VALUE: 100000,
} as const;

/**
 * テストタイプの定数
 */
export const TEST_TYPES = {
  COMMON: 'common',
  INDIVIDUAL: 'individual',
} as const;

/**
 * バリデーションルール
 */
export const VALIDATION_RULES = {
  NAME: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 100,
    PATTERN: /^[\p{L}\p{N}\p{P}\p{Z}]+$/u,
  },
  CODE: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 20,
    PATTERN: /^[A-Z0-9-]+$/,
  },
  ENROLLMENT: {
    MIN: 1,
    MAX: 1000,
  },
} as const;
