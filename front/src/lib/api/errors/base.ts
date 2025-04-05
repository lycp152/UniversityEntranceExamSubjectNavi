/**
 * APIエラーの詳細情報を定義するインターフェース
 *
 * @interface ApiErrorDetails
 * @property {string} code - エラーコード（一意の識別子）
 * @property {string} message - エラーメッセージ（ユーザー向けの説明）
 * @property {number} [status] - HTTPステータスコード（デフォルト: 500）
 * @property {Record<string, unknown>} [details] - 追加のエラー詳細情報
 * @see {@link ../validation/validation-messages.ts} バリデーションエラーメッセージの定義
 */
export interface ApiErrorDetails {
  code: string;
  message: string;
  status?: number;
  details?: Record<string, unknown>;
}

/**
 * APIエラーの基底クラス
 * すべてのAPI関連エラーの基本となるクラス
 *
 * @class BaseApiError
 * @extends Error
 * @property {readonly string} code - エラーコード
 * @property {readonly number} status - HTTPステータスコード
 * @property {readonly Record<string, unknown>} [details] - 追加のエラー詳細
 * @see {@link ../validation/validation-messages.ts} バリデーションエラーメッセージの定義
 * @see {@link ../config/env.ts} 環境変数の設定と検証
 */
export class BaseApiError extends Error {
  readonly code: string;
  readonly status: number;
  readonly details?: Record<string, unknown>;

  /**
   * @param {ApiErrorDetails} error - エラー詳細情報
   */
  constructor(error: ApiErrorDetails) {
    super(error.message);
    this.name = this.constructor.name;
    this.code = error.code;
    this.status = error.status ?? 500;
    this.details = error.details;
  }
}
