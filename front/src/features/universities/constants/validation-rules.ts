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
