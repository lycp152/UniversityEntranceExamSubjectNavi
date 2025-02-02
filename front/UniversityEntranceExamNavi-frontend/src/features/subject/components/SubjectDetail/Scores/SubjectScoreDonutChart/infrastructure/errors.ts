import { ValidationErrorCode } from "./types";

/**
 * バリデーション関連のエラーを表すクラス
 */
export class ValidationError extends Error {
  /**
   * @param message エラーメッセージ
   * @param code エラーコード
   */
  constructor(message: string, public readonly code: ValidationErrorCode) {
    super(message);
    this.name = "ValidationError";
    // Error クラスの prototype チェーンを正しく設定
    Object.setPrototypeOf(this, ValidationError.prototype);
  }

  /**
   * エラーの文字列表現を返す
   */
  toString(): string {
    return `${this.name}[${this.code}]: ${this.message}`;
  }

  /**
   * エラーが特定のコードかどうかを判定
   */
  is(code: ValidationErrorCode): boolean {
    return this.code === code;
  }
}
