export const ValidationErrorCodes = {
  INVALID_NUMBER: "INVALID_NUMBER",
  INVALID_METADATA: "INVALID_METADATA",
  INVALID_RESULT: "INVALID_RESULT",
  CACHE_ERROR: "CACHE_ERROR",
  INVALID_PARAMS: "INVALID_PARAMS",
} as const;

export type ValidationErrorCode =
  (typeof ValidationErrorCodes)[keyof typeof ValidationErrorCodes];
