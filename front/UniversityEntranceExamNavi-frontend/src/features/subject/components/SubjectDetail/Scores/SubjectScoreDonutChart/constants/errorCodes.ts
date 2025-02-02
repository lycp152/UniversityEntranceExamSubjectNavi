export const ERROR_CODES = {
  INVALID_SCORE: "INVALID_SCORE",
  MISSING_SCORE: "MISSING_SCORE",
  ZERO_SCORE: "ZERO_SCORE",
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

export const ERROR_MESSAGES = {
  [ERROR_CODES.INVALID_SCORE]: "無効なスコアです",
  [ERROR_CODES.MISSING_SCORE]: "スコアが見つかりません",
  [ERROR_CODES.ZERO_SCORE]: "スコアが0です",
} as const;
