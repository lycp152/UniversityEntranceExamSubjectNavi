/**
 * ドメインエラーコードの定義
 * アプリケーション全体で使用されるエラーコードを定義します
 */

/**
 * API関連のエラーコード
 * HTTPリクエストやAPI通信に関するエラーを定義
 */
export const API_ERROR_CODES = {
  /** ネットワーク接続エラー */
  NETWORK_ERROR: 'NETWORK_ERROR',
  /** リクエストタイムアウト */
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  /** 認証エラー */
  UNAUTHORIZED: 'UNAUTHORIZED',
  /** アクセス権限エラー */
  FORBIDDEN: 'FORBIDDEN',
  /** リソース未検出エラー */
  NOT_FOUND: 'NOT_FOUND',
  /** APIバリデーションエラー */
  API_VALIDATION_ERROR: 'API_VALIDATION_ERROR',
  /** サーバー内部エラー */
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
} as const;

/**
 * スコア関連のエラーコード
 * 点数計算やスコア処理に関するエラーを定義
 */
export const SCORE_ERROR_CODES = {
  /** 無効なスコア値 */
  INVALID_SCORE: 'INVALID_SCORE',
  /** スコア未設定 */
  MISSING_SCORE: 'MISSING_SCORE',
  /** スコア範囲エラー */
  INVALID_RANGE: 'INVALID_RANGE',
  /** 重み付けエラー */
  INVALID_WEIGHT: 'INVALID_WEIGHT',
  /** 計算処理エラー */
  CALCULATION_ERROR: 'CALCULATION_ERROR',
  /** 最大スコア超過 */
  MAX_SCORE_EXCEEDED: 'MAX_SCORE_EXCEEDED',
  /** 負のスコア値 */
  NEGATIVE_SCORE: 'NEGATIVE_SCORE',
} as const;

/**
 * バリデーション関連のエラーコード
 * データ検証や入力値チェックに関するエラーを定義
 */
export const VALIDATION_ERROR_CODES = {
  /** バージョン形式エラー */
  INVALID_VERSION: 'INVALID_VERSION',
  /** 名前形式エラー */
  INVALID_NAME: 'INVALID_NAME',
  /** 大学ID未設定 */
  REQUIRED_UNIVERSITY_ID: 'REQUIRED_UNIVERSITY_ID',
  /** 学年度エラー */
  INVALID_ACADEMIC_YEAR: 'INVALID_ACADEMIC_YEAR',
  /** 定員数エラー */
  INVALID_ENROLLMENT: 'INVALID_ENROLLMENT',
  /** ステータス形式エラー */
  INVALID_STATUS: 'INVALID_STATUS',
  /** スケジュール名エラー */
  INVALID_SCHEDULE_NAME: 'INVALID_SCHEDULE_NAME',
  /** 試験区分エラー */
  INVALID_TEST_TYPE: 'INVALID_TEST_TYPE',
} as const;

/** エラーコードの型定義 */
export type ApiErrorCode = keyof typeof API_ERROR_CODES;
export type ScoreErrorCode = keyof typeof SCORE_ERROR_CODES;
export type ValidationErrorCode = keyof typeof VALIDATION_ERROR_CODES;
export type ErrorCode =
  | (typeof API_ERROR_CODES)[keyof typeof API_ERROR_CODES]
  | (typeof SCORE_ERROR_CODES)[keyof typeof SCORE_ERROR_CODES]
  | (typeof VALIDATION_ERROR_CODES)[keyof typeof VALIDATION_ERROR_CODES];

/**
 * エラーメッセージの定義
 * 各エラーコードに対応するユーザーフレンドリーなメッセージを定義
 */
export const ERROR_MESSAGES: Record<string, string> = {
  // APIエラーメッセージ
  [API_ERROR_CODES.NETWORK_ERROR]: 'ネットワークエラーが発生しました',
  [API_ERROR_CODES.TIMEOUT_ERROR]: 'リクエストがタイムアウトしました',
  [API_ERROR_CODES.UNAUTHORIZED]: '認証が必要です',
  [API_ERROR_CODES.FORBIDDEN]: 'アクセス権限がありません',
  [API_ERROR_CODES.NOT_FOUND]: 'リソースが見つかりません',
  [API_ERROR_CODES.API_VALIDATION_ERROR]: '入力内容に誤りがあります',
  [API_ERROR_CODES.INTERNAL_SERVER_ERROR]: 'サーバーエラーが発生しました',

  // スコアエラーメッセージ
  [SCORE_ERROR_CODES.INVALID_SCORE]: '無効なスコアです',
  [SCORE_ERROR_CODES.MISSING_SCORE]: 'スコアが見つかりません',
  [SCORE_ERROR_CODES.INVALID_RANGE]: '点数は0から1000の間で入力してください',
  [SCORE_ERROR_CODES.INVALID_WEIGHT]: '重みは0から100の間で入力してください',
  [SCORE_ERROR_CODES.CALCULATION_ERROR]: '計算中にエラーが発生しました',
  [SCORE_ERROR_CODES.MAX_SCORE_EXCEEDED]: '最大値（1000点）を超えるスコアです',
  [SCORE_ERROR_CODES.NEGATIVE_SCORE]: '負の値のスコアは無効です',

  // バリデーションエラーメッセージ
  [VALIDATION_ERROR_CODES.INVALID_VERSION]: 'バージョンは0より大きい必要があります',
  [VALIDATION_ERROR_CODES.INVALID_NAME]:
    '名前は1-100文字の範囲で、特殊文字を含まない必要があります',
  [VALIDATION_ERROR_CODES.REQUIRED_UNIVERSITY_ID]: '大学IDは必須です',
  [VALIDATION_ERROR_CODES.INVALID_ACADEMIC_YEAR]:
    '学年度は2000年から2100年の間である必要があります',
  [VALIDATION_ERROR_CODES.INVALID_ENROLLMENT]: '定員は1から9999の間である必要があります',
  [VALIDATION_ERROR_CODES.INVALID_STATUS]: '無効なステータスです',
  [VALIDATION_ERROR_CODES.INVALID_SCHEDULE_NAME]:
    '無効なスケジュール名です（前期、中期、後期のいずれか）',
  [VALIDATION_ERROR_CODES.INVALID_TEST_TYPE]: '無効な試験区分です（共通、二次のいずれか）',
};

/** エラーメッセージの型定義 */
export type ApiErrorMessage = (typeof ERROR_MESSAGES)[ApiErrorCode];
export type ScoreErrorMessage = (typeof ERROR_MESSAGES)[ScoreErrorCode];
export type ValidationErrorMessage = (typeof ERROR_MESSAGES)[ValidationErrorCode];
