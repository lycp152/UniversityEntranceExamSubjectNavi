/**
 * 認証関連のインターセプターを実装するクラス
 * APIリクエストに認証トークンを自動的に付加する機能を提供
 *
 * @class AuthInterceptorImpl
 * @implements {RequestInterceptor}
 */
import type { RequestInterceptor } from '.';
import type { HttpRequestConfig } from '@/types/api/http-types';
import { ENV } from '@/lib/config/env';

class AuthInterceptorImpl {
  /**
   * ローカルストレージから認証トークンを取得
   * サーバーサイドレンダリング時はnullを返す
   *
   * @private
   * @returns {string | null} 認証トークン、またはnull
   */
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(ENV.AUTH.TOKEN_KEY);
  }

  /**
   * リクエストインターセプター
   * 認証トークンが存在する場合、リクエストヘッダーにBearerトークンを追加
   *
   * @param {HttpRequestConfig} config - 元のリクエスト設定
   * @returns {Promise<HttpRequestConfig>} 認証ヘッダーが追加されたリクエスト設定
   */
  intercept: RequestInterceptor = async (config: HttpRequestConfig): Promise<HttpRequestConfig> => {
    const token = this.getAuthToken();
    if (!token) return config;

    return {
      ...config,
      headers: {
        ...config.headers,
        Authorization: `${ENV.AUTH.TOKEN_PREFIX} ${token}`,
      },
    };
  };
}

/**
 * 認証インターセプターのシングルトンインスタンス
 * すべてのAPIリクエストに適用される認証処理を提供
 */
export const authInterceptor: RequestInterceptor = new AuthInterceptorImpl().intercept;
