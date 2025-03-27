// API関連のエラーコード
export const API_ERROR_CODES = {
  NETWORK_ERROR: "NETWORK_ERROR",
  TIMEOUT_ERROR: "TIMEOUT_ERROR",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  API_VALIDATION_ERROR: "API_VALIDATION_ERROR",
  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
} as const;

// スコア関連のエラーコード
export const SCORE_ERROR_CODES = {
  INVALID_SCORE: "INVALID_SCORE",
  MISSING_SCORE: "MISSING_SCORE",
  INVALID_RANGE: "INVALID_RANGE",
  INVALID_WEIGHT: "INVALID_WEIGHT",
  CALCULATION_ERROR: "CALCULATION_ERROR",
  MAX_SCORE_EXCEEDED: "MAX_SCORE_EXCEEDED",
  NEGATIVE_SCORE: "NEGATIVE_SCORE",
} as const;

// バリデーション関連のエラーコード
export const VALIDATION_ERROR_CODES = {
  INVALID_VERSION: "INVALID_VERSION",
  INVALID_NAME: "INVALID_NAME",
  REQUIRED_UNIVERSITY_ID: "REQUIRED_UNIVERSITY_ID",
  INVALID_ACADEMIC_YEAR: "INVALID_ACADEMIC_YEAR",
  INVALID_ENROLLMENT: "INVALID_ENROLLMENT",
  INVALID_STATUS: "INVALID_STATUS",
  INVALID_SCHEDULE_NAME: "INVALID_SCHEDULE_NAME",
  INVALID_TEST_TYPE: "INVALID_TEST_TYPE",
} as const;

// エラーメッセージの定義
export const ERROR_MESSAGES: Record<string, string> = {
  // APIエラーメッセージ
  [API_ERROR_CODES.NETWORK_ERROR]: "ネットワークエラーが発生しました",
  [API_ERROR_CODES.TIMEOUT_ERROR]: "リクエストがタイムアウトしました",
  [API_ERROR_CODES.UNAUTHORIZED]: "認証が必要です",
  [API_ERROR_CODES.FORBIDDEN]: "アクセス権限がありません",
  [API_ERROR_CODES.NOT_FOUND]: "リソースが見つかりません",
  [API_ERROR_CODES.API_VALIDATION_ERROR]: "入力内容に誤りがあります",
  [API_ERROR_CODES.INTERNAL_SERVER_ERROR]: "サーバーエラーが発生しました",

  // スコアエラーメッセージ
  [SCORE_ERROR_CODES.INVALID_SCORE]: "無効なスコアです",
  [SCORE_ERROR_CODES.MISSING_SCORE]: "スコアが見つかりません",
  [SCORE_ERROR_CODES.INVALID_RANGE]: "点数は0から1000の間で入力してください",
  [SCORE_ERROR_CODES.INVALID_WEIGHT]: "重みは0から100の間で入力してください",
  [SCORE_ERROR_CODES.CALCULATION_ERROR]: "計算中にエラーが発生しました",
  [SCORE_ERROR_CODES.MAX_SCORE_EXCEEDED]: "最大値（1000点）を超えるスコアです",
  [SCORE_ERROR_CODES.NEGATIVE_SCORE]: "負の値のスコアは無効です",

  // バリデーションエラーメッセージ
  [VALIDATION_ERROR_CODES.INVALID_VERSION]:
    "バージョンは0より大きい必要があります",
  [VALIDATION_ERROR_CODES.INVALID_NAME]:
    "名前は1-100文字の範囲で、特殊文字を含まない必要があります",
  [VALIDATION_ERROR_CODES.REQUIRED_UNIVERSITY_ID]: "大学IDは必須です",
  [VALIDATION_ERROR_CODES.INVALID_ACADEMIC_YEAR]:
    "学年度は2000年から2100年の間である必要があります",
  [VALIDATION_ERROR_CODES.INVALID_ENROLLMENT]:
    "定員は1から9999の間である必要があります",
  [VALIDATION_ERROR_CODES.INVALID_STATUS]: "無効なステータスです",
  [VALIDATION_ERROR_CODES.INVALID_SCHEDULE_NAME]:
    "無効なスケジュール名です（前期、中期、後期のいずれか）",
  [VALIDATION_ERROR_CODES.INVALID_TEST_TYPE]:
    "無効な試験区分です（共通、二次のいずれか）",
};

// エラーコードの型定義
export type ApiErrorCode = keyof typeof API_ERROR_CODES;
export type ScoreErrorCode = keyof typeof SCORE_ERROR_CODES;
export type ValidationErrorCode = keyof typeof VALIDATION_ERROR_CODES;

// エラーメッセージの型定義
export type ApiErrorMessage = (typeof ERROR_MESSAGES)[ApiErrorCode];
export type ScoreErrorMessage = (typeof ERROR_MESSAGES)[ScoreErrorCode];
export type ValidationErrorMessage =
  (typeof ERROR_MESSAGES)[ValidationErrorCode];

/**
 * アプリケーション全体で使用されるエラーコードの型定義
 */
export type ErrorCode =
  | (typeof API_ERROR_CODES)[keyof typeof API_ERROR_CODES]
  | (typeof SCORE_ERROR_CODES)[keyof typeof SCORE_ERROR_CODES];
