/**
 * HTTPリクエストを実行し、インターセプターを管理するコアクラス
 * タイムアウト制御、エラーハンドリング、レスポンス加工を一元管理
 *
 * @class ApiClient
 * @description
 * - すべてのHTTPリクエストの実行を担当
 * - インターセプターによるリクエスト/レスポンスの加工
 * - エラーハンドリングとタイムアウト制御
 * - シングルトンとして提供され、アプリケーション全体で共有
 */
import type { ApiClientConfig } from '@/features/universities/types/api-client-config';
import type { HttpResponse, HttpRequestConfig } from '@/types/api/http-types';
import { ApiClientError, NetworkError, TimeoutError } from '@/lib/api/errors/client';
import { ENV } from '@/lib/env';
import { ERROR_MESSAGES, API_ERROR_CODES } from '@/constants/errors/domain';
import type {
  RequestInterceptor,
  ResponseInterceptor,
  ErrorInterceptor,
} from '@/features/universities/lib/middleware';
import { InterceptorManager } from '@/features/universities/lib/middleware';

export class ApiClient {
  private readonly baseURL: string;
  private readonly defaultHeaders: Record<string, string>;
  private readonly timeout: number;
  private readonly interceptors: InterceptorManager;

  /**
   * APIクライアントのコンストラクタ
   *
   * @param {ApiClientConfig} config - クライアントの設定
   * @property {string} baseURL - APIのベースURL
   * @property {Record<string, string>} defaultHeaders - デフォルトのHTTPヘッダー
   * @property {number} timeout - リクエストのタイムアウト時間（ミリ秒）
   */
  constructor(config: ApiClientConfig) {
    this.baseURL = config.baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...config.defaultHeaders,
    };
    this.timeout = config.timeout ?? ENV.API.TIMEOUT;
    this.interceptors = new InterceptorManager();

    this.setupDefaultInterceptors();
  }

  /**
   * デフォルトのエラーインターセプターを設定
   * サーバーエラーをApiClientErrorに変換し、エラーハンドリングを統一
   *
   * @private
   */
  private setupDefaultInterceptors(): void {
    this.interceptors.addErrorInterceptor(async error => {
      if (error instanceof Response) {
        const data = await error.json();
        throw new ApiClientError({
          code: data.code ?? API_ERROR_CODES.INTERNAL_SERVER_ERROR,
          message: data.message ?? ERROR_MESSAGES[API_ERROR_CODES.INTERNAL_SERVER_ERROR],
          status: error.status,
          details: data.details,
        });
      }
      throw error;
    });
  }

  /**
   * インターセプターマネージャーへのアクセスを提供
   *
   * @returns {InterceptorManager} インターセプターマネージャーのインスタンス
   */
  public getInterceptorManager(): InterceptorManager {
    return this.interceptors;
  }

  /**
   * リクエストインターセプターを追加
   *
   * @param {RequestInterceptor} interceptor - 追加するリクエストインターセプター
   */
  public addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.interceptors.addRequestInterceptor(interceptor);
  }

  /**
   * レスポンスインターセプターを追加
   *
   * @param {ResponseInterceptor} interceptor - 追加するレスポンスインターセプター
   */
  public addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.interceptors.addResponseInterceptor(interceptor);
  }

  /**
   * エラーインターセプターを追加
   *
   * @param {ErrorInterceptor} interceptor - 追加するエラーインターセプター
   */
  public addErrorInterceptor(interceptor: ErrorInterceptor): void {
    this.interceptors.addErrorInterceptor(interceptor);
  }

  /**
   * HTTPリクエストを実行する汎用メソッド
   * タイムアウト制御とインターセプターの実行を管理
   *
   * @template T - レスポンスデータの型
   * @param {string} path - APIエンドポイントのパス
   * @param {HttpRequestConfig} config - リクエスト設定
   * @returns {Promise<HttpResponse<T>>} レスポンスデータ
   * @throws {TimeoutError} リクエストがタイムアウトした場合
   * @throws {NetworkError} ネットワークエラーが発生した場合
   * @throws {ApiClientError} APIエラーが発生した場合
   */
  async request<T>(path: string, config: HttpRequestConfig): Promise<HttpResponse<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const finalConfig = await this.interceptors.runRequestInterceptors({
        ...config,
        headers: {
          ...this.defaultHeaders,
          ...config.headers,
        },
        signal: config.signal ?? controller.signal,
      });

      const response = await fetch(`${this.baseURL}${path}`, finalConfig);
      clearTimeout(timeoutId);

      const processedResponse = await this.interceptors.runResponseInterceptors(response);

      if (!processedResponse.ok) {
        await this.interceptors.runErrorInterceptors(processedResponse);
      }

      const data = await processedResponse.json();
      const headers: Record<string, string> = {};
      processedResponse.headers.forEach((value, key) => {
        headers[key] = value;
      });

      return {
        data,
        status: processedResponse.status,
        httpStatus: processedResponse.status,
        headers,
      };
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof ApiClientError) {
        throw error;
      }

      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new TimeoutError();
      }

      throw new NetworkError();
    }
  }

  /**
   * GETリクエストを実行
   *
   * @template T - レスポンスデータの型
   * @param {string} path - APIエンドポイントのパス
   * @param {Omit<HttpRequestConfig, 'method'>} [config] - リクエスト設定（methodを除く）
   * @returns {Promise<T>} レスポンスデータ
   */
  async get<T>(path: string, config?: Omit<HttpRequestConfig, 'method'>): Promise<T> {
    const response = await this.request<T>(path, { ...config, method: 'GET' });
    return response.data;
  }

  /**
   * POSTリクエストを実行
   *
   * @template T - レスポンスデータの型
   * @param {string} path - APIエンドポイントのパス
   * @param {Record<string, unknown>} [data] - リクエストボディ
   * @param {Omit<HttpRequestConfig, 'method' | 'body'>} [config] - リクエスト設定（methodとbodyを除く）
   * @returns {Promise<T>} レスポンスデータ
   */
  async post<T>(
    path: string,
    data?: Record<string, unknown>,
    config?: Omit<HttpRequestConfig, 'method' | 'body'>
  ): Promise<T> {
    const response = await this.request<T>(path, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
    return response.data;
  }

  /**
   * PUTリクエストを実行
   *
   * @template T - レスポンスデータの型
   * @param {string} path - APIエンドポイントのパス
   * @param {Record<string, unknown>} [data] - リクエストボディ
   * @param {Omit<HttpRequestConfig, 'method' | 'body'>} [config] - リクエスト設定（methodとbodyを除く）
   * @returns {Promise<T>} レスポンスデータ
   */
  async put<T>(
    path: string,
    data?: Record<string, unknown>,
    config?: Omit<HttpRequestConfig, 'method' | 'body'>
  ): Promise<T> {
    const response = await this.request<T>(path, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
    return response.data;
  }

  /**
   * DELETEリクエストを実行
   *
   * @template T - レスポンスデータの型
   * @param {string} path - APIエンドポイントのパス
   * @param {Omit<HttpRequestConfig, 'method'>} [config] - リクエスト設定（methodを除く）
   * @returns {Promise<T>} レスポンスデータ
   */
  async delete<T>(path: string, config?: Omit<HttpRequestConfig, 'method'>): Promise<T> {
    const response = await this.request<T>(path, {
      ...config,
      method: 'DELETE',
    });
    return response.data;
  }
}

/**
 * シングルトンとしてAPIクライアントをエクスポート
 * アプリケーション全体で共有される単一のインスタンス
 */
export const apiClient = new ApiClient({
  baseURL: ENV.API.BASE_URL,
});
