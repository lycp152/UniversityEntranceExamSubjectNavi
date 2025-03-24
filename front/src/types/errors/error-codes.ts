import {
  API_ERROR_CODES,
  SCORE_ERROR_CODES,
} from "@/constants/domain-error-codes";

/**
 * アプリケーション全体で使用されるエラーコードの型定義
 */
export type ErrorCode =
  | (typeof API_ERROR_CODES)[keyof typeof API_ERROR_CODES]
  | (typeof SCORE_ERROR_CODES)[keyof typeof SCORE_ERROR_CODES];
