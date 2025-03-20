import { TEST_TYPES } from "../../types/score";

/**
 * スコア関連のエラーコード
 */
export const ScoreErrorCodes = {
  INVALID_SCORE: "INVALID_SCORE",
  CALCULATION_ERROR: "CALCULATION_ERROR",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  MAX_SCORE_EXCEEDED: "MAX_SCORE_EXCEEDED",
  NEGATIVE_SCORE: "NEGATIVE_SCORE",
  INVALID_TEST_TYPE: "INVALID_TEST_TYPE",
  CACHE_ERROR: "CACHE_ERROR",
  DATA_INTEGRITY_ERROR: "DATA_INTEGRITY_ERROR",
} as const;

export type ScoreErrorCode =
  (typeof ScoreErrorCodes)[keyof typeof ScoreErrorCodes];

/**
 * エラーメッセージのマッピング
 */
const ERROR_MESSAGES: Record<ScoreErrorCode, string> = {
  [ScoreErrorCodes.INVALID_SCORE]: "無効なスコアです",
  [ScoreErrorCodes.CALCULATION_ERROR]: "計算中にエラーが発生しました",
  [ScoreErrorCodes.VALIDATION_ERROR]: "検証エラーが発生しました",
  [ScoreErrorCodes.MAX_SCORE_EXCEEDED]: "最大値を超えるスコアです",
  [ScoreErrorCodes.NEGATIVE_SCORE]: "負の値のスコアは無効です",
  [ScoreErrorCodes.INVALID_TEST_TYPE]: "無効なテスト種別です",
  [ScoreErrorCodes.CACHE_ERROR]: "キャッシュ操作中にエラーが発生しました",
  [ScoreErrorCodes.DATA_INTEGRITY_ERROR]: "データの整合性が損なわれています",
};

/**
 * スコア関連の基本エラークラス
 *
 * @example
 * ```typescript
 * throw new ScoreError(
 *   'スコアの計算に失敗しました',
 *   ScoreErrorCodes.CALCULATION_ERROR,
 *   'commonTest',
 *   { value: 150, maxValue: 100 }
 * );
 * ```
 */
export class ScoreError extends Error {
  constructor(
    message: string,
    public readonly code: ScoreErrorCode,
    public readonly field?: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "ScoreError";
    Object.setPrototypeOf(this, ScoreError.prototype);

    // スタックトレースの保持（開発環境のみ）
    if (process.env.NODE_ENV === "development") {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * エラーの文字列表現を生成
   */
  toString(): string {
    const parts = [`[${this.code}] ${this.message}`];
    if (this.field) {
      parts.push(`フィールド: ${this.field}`);
    }
    if (this.details) {
      parts.push(`詳細: ${JSON.stringify(this.details, null, 2)}`);
    }
    return parts.join(" | ");
  }

  /**
   * エラーをログ形式に変換
   */
  toLog(): Record<string, unknown> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      field: this.field,
      details: this.details,
      timestamp: new Date().toISOString(),
      stack: process.env.NODE_ENV === "development" ? this.stack : undefined,
    };
  }
}

/**
 * スコアの検証エラー
 */
export class ScoreValidationError extends ScoreError {
  constructor(
    message: string,
    field?: string,
    details?: Record<string, unknown>
  ) {
    super(message, ScoreErrorCodes.VALIDATION_ERROR, field, details);
    this.name = "ScoreValidationError";
    Object.setPrototypeOf(this, ScoreValidationError.prototype);
  }
}

/**
 * スコアの計算エラー
 */
export class ScoreCalculationError extends ScoreError {
  constructor(
    message: string,
    field?: string,
    details?: Record<string, unknown>
  ) {
    super(message, ScoreErrorCodes.CALCULATION_ERROR, field, details);
    this.name = "ScoreCalculationError";
    Object.setPrototypeOf(this, ScoreCalculationError.prototype);
  }
}

/**
 * エラーメッセージを生成
 *
 * @param code - エラーコード
 * @param field - エラーが発生したフィールド
 * @param details - 追加の詳細情報
 * @returns フォーマットされたエラーメッセージ
 */
export const createErrorMessage = (
  code: ScoreErrorCode,
  field?: string,
  details?: Record<string, unknown>
): string => {
  const baseMessage = ERROR_MESSAGES[code] || "不明なエラーが発生しました";
  const parts = [baseMessage];

  if (field) {
    const testType = Object.values(TEST_TYPES).includes(
      field as (typeof TEST_TYPES)[keyof typeof TEST_TYPES]
    )
      ? `${field}の`
      : `${field}における`;
    parts.unshift(testType);
  }

  if (details) {
    const detailsStr = Object.entries(details)
      .map(([key, value]) => `${key}: ${value}`)
      .join(", ");
    parts.push(`(${detailsStr})`);
  }

  return parts.join(" ");
};
