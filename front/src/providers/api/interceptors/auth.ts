import type { RequestInterceptor } from '../client/interceptors';
import type { RequestConfig } from '../client/types';

class AuthInterceptorImpl {
  private getAuthToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  intercept: RequestInterceptor = async (config: RequestConfig): Promise<RequestConfig> => {
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

export const authInterceptor: RequestInterceptor = new AuthInterceptorImpl().intercept;
