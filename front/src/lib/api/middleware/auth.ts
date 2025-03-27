// 認証関連のインターセプターを実装するクラス
// APIリクエストにAuthorizationヘッダーを追加する
import type { RequestInterceptor } from ".";
import type { HttpRequestConfig } from "@/lib/api/types/http";
import { ENV } from "@/lib/config/env";

class AuthInterceptorImpl {
  // ローカルストレージから認証トークンを取得
  // サーバーサイドでの実行時はnullを返す
  private getAuthToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(ENV.AUTH.TOKEN_KEY);
  }

  // リクエストインターセプター
  // 認証トークンが存在する場合、リクエストヘッダーにBearerトークンを追加
  intercept: RequestInterceptor = async (
    config: HttpRequestConfig
  ): Promise<HttpRequestConfig> => {
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

// シングルトンとしてインターセプターをエクスポート
export const authInterceptor: RequestInterceptor = new AuthInterceptorImpl()
  .intercept;
