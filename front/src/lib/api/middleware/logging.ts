/**
 * APIリクエスト・レスポンスのロギングを行うインターセプター
 * 開発環境でのデバッグを支援するためのログ出力を提供
 *
 * @class LoggingInterceptor
 */
import type { HttpRequestConfig } from '@/types/api/http-types';
import { isDevelopment } from '@/lib/config/env';

export class LoggingInterceptor {
  /**
   * リクエストの内容をコンソールに出力
   * 開発環境でのみ実行され、リクエストの詳細情報を表示
   *
   * @param {HttpRequestConfig} config - リクエスト設定
   * @returns {Promise<HttpRequestConfig>} 元のリクエスト設定
   */
  async interceptRequest(config: HttpRequestConfig): Promise<HttpRequestConfig> {
    if (isDevelopment) {
      console.group('API Request');
      console.log('Method:', config.method);
      console.log('Headers:', config.headers);
      console.log('Body:', config.body);
      console.groupEnd();
    }
    return config;
  }

  /**
   * レスポンスの内容をコンソールに出力
   * 開発環境でのみ実行され、レスポンスの詳細情報を表示
   * JSONレスポンスのパースを試み、失敗した場合はその旨を表示
   *
   * @param {Response} response - APIレスポンス
   * @returns {Promise<Response>} 元のレスポンス
   */
  async interceptResponse(response: Response): Promise<Response> {
    if (isDevelopment) {
      console.group('API Response');
      console.log('Status:', response.status);
      console.log('Status Text:', response.statusText);
      console.log('Headers:', Object.fromEntries(response.headers.entries()));
      const clonedResponse = response.clone();
      try {
        const body = await clonedResponse.json();
        console.log('Body:', body);
      } catch {
        console.log('Body: Unable to parse JSON');
      }
      console.groupEnd();
    }
    return response;
  }
}

/**
 * リクエストロギングインターセプターのシングルトンインスタンス
 * すべてのAPIリクエストのログを出力
 */
export const loggingRequestInterceptor = new LoggingInterceptor().interceptRequest.bind(
  new LoggingInterceptor()
);

/**
 * レスポンスロギングインターセプターのシングルトンインスタンス
 * すべてのAPIレスポンスのログを出力
 */
export const loggingResponseInterceptor = new LoggingInterceptor().interceptResponse.bind(
  new LoggingInterceptor()
);
