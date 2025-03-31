/**
 * エラーログを記録するためのクラス
 */
export class ErrorLogger {
  /**
   * エラーメッセージとコンテキストを記録します
   * @param message エラーメッセージ
   * @param context エラーのコンテキスト情報
   */
  error(message: string, context?: Record<string, unknown>): void {
    console.error(`[Error] ${message}`, context);
  }

  /**
   * 警告メッセージとコンテキストを記録します
   * @param message 警告メッセージ
   * @param context 警告のコンテキスト情報
   */
  warn(message: string, context?: Record<string, unknown>): void {
    console.warn(`[Warning] ${message}`, context);
  }

  /**
   * 情報メッセージとコンテキストを記録します
   * @param message 情報メッセージ
   * @param context 情報のコンテキスト情報
   */
  info(message: string, context?: Record<string, unknown>): void {
    console.info(`[Info] ${message}`, context);
  }
}
