import type { RequestInterceptor } from ".";
import type { RequestConfig } from "@/types/api/common/request";

class AuthInterceptorImpl {
  private getAuthToken(): string | null {
    return localStorage.getItem("auth_token");
  }

  intercept: RequestInterceptor = async (
    config: RequestConfig
  ): Promise<RequestConfig> => {
    const token = this.getAuthToken();
    if (!token) return config;

    return {
      ...config,
      headers: {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      },
    };
  };
}

export const authInterceptor: RequestInterceptor = new AuthInterceptorImpl()
  .intercept;
