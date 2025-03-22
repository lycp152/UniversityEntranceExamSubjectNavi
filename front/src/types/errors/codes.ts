export const API_ERROR_CODES = {
  NETWORK_ERROR: "NETWORK_ERROR",
  TIMEOUT_ERROR: "TIMEOUT_ERROR",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
} as const;

export type ApiErrorCode =
  (typeof API_ERROR_CODES)[keyof typeof API_ERROR_CODES];

export const ERROR_MESSAGES: Record<ApiErrorCode, string> = {
  [API_ERROR_CODES.NETWORK_ERROR]: "ネットワークエラーが発生しました",
  [API_ERROR_CODES.TIMEOUT_ERROR]: "リクエストがタイムアウトしました",
  [API_ERROR_CODES.UNAUTHORIZED]: "認証が必要です",
  [API_ERROR_CODES.FORBIDDEN]: "アクセス権限がありません",
  [API_ERROR_CODES.NOT_FOUND]: "リソースが見つかりません",
  [API_ERROR_CODES.VALIDATION_ERROR]: "入力内容に誤りがあります",
  [API_ERROR_CODES.INTERNAL_SERVER_ERROR]: "サーバーエラーが発生しました",
};
