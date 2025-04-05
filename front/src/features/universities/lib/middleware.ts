import type { HttpRequestConfig } from '@/types/api/http-types';

/**
 * APIリクエストの加工処理を定義するインターフェース
 * リクエスト設定を変更または検証する処理を表現
 *
 * @typedef {Function} RequestInterceptor
 * @param {HttpRequestConfig} config - 元のリクエスト設定
 * @returns {Promise<HttpRequestConfig>} 加工されたリクエスト設定
 */
export type RequestInterceptor = (config: HttpRequestConfig) => Promise<HttpRequestConfig>;

/**
 * APIレスポンスの加工処理を定義するインターフェース
 * レスポンスを変更または検証する処理を表現
 *
 * @typedef {Function} ResponseInterceptor
 * @param {Response} response - 元のレスポンス
 * @returns {Promise<Response>} 加工されたレスポンス
 */
export type ResponseInterceptor = (response: Response) => Promise<Response>;

/**
 * エラーハンドリング処理を定義するインターフェース
 * エラーを処理または変換する処理を表現
 *
 * @typedef {Function} ErrorInterceptor
 * @param {unknown} error - 発生したエラー
 * @returns {Promise<never>} 処理されたエラー
 */
export type ErrorInterceptor = (error: unknown) => Promise<never>;

/**
 * インターセプターを管理するクラス
 * APIリクエスト・レスポンスの処理パイプラインを制御
 *
 * @class InterceptorManager
 */
export class InterceptorManager {
  private readonly requestInterceptors: RequestInterceptor[] = [];
  private readonly responseInterceptors: ResponseInterceptor[] = [];
  private readonly errorInterceptors: ErrorInterceptor[] = [];

  /**
   * リクエストインターセプターを登録
   *
   * @param {RequestInterceptor} interceptor - 登録するインターセプター
   */
  addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor);
  }

  /**
   * レスポンスインターセプターを登録
   *
   * @param {ResponseInterceptor} interceptor - 登録するインターセプター
   */
  addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.push(interceptor);
  }

  /**
   * エラーインターセプターを登録
   *
   * @param {ErrorInterceptor} interceptor - 登録するインターセプター
   */
  addErrorInterceptor(interceptor: ErrorInterceptor): void {
    this.errorInterceptors.push(interceptor);
  }

  /**
   * リクエストインターセプターを順次実行
   * 前のインターセプターの結果を次のインターセプターに渡す
   *
   * @param {HttpRequestConfig} config - 元のリクエスト設定
   * @returns {Promise<HttpRequestConfig>} すべてのインターセプターを通過したリクエスト設定
   */
  async runRequestInterceptors(config: HttpRequestConfig): Promise<HttpRequestConfig> {
    return this.requestInterceptors.reduce(
      async (promise, interceptor) => interceptor(await promise),
      Promise.resolve({ ...config })
    );
  }

  /**
   * レスポンスインターセプターを順次実行
   * 前のインターセプターの結果を次のインターセプターに渡す
   *
   * @param {Response} response - 元のレスポンス
   * @returns {Promise<Response>} すべてのインターセプターを通過したレスポンス
   */
  async runResponseInterceptors(response: Response): Promise<Response> {
    return this.responseInterceptors.reduce(
      async (promise, interceptor) => interceptor(await promise),
      Promise.resolve(response)
    );
  }

  /**
   * エラーインターセプターを実行
   * エラーが解決されるまで順次実行し、最終的に解決できない場合は元のエラーを投げる
   *
   * @param {unknown} error - 発生したエラー
   * @returns {Promise<never>} 処理されたエラー
   */
  async runErrorInterceptors(error: unknown): Promise<never> {
    for (const interceptor of this.errorInterceptors) {
      try {
        return await interceptor(error);
      } catch (e) {
        error = e;
      }
    }
    return Promise.reject(error instanceof Error ? error : new Error(String(error)));
  }
}
