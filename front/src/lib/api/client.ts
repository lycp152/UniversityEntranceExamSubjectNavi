import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// レスポンスインターセプター
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    // エラーハンドリング
    if (error.response) {
      // サーバーからのレスポンスがある場合
      switch (error.response.status) {
        case 401:
          // 認証エラー
          break;
        case 403:
          // 権限エラー
          break;
        case 404:
          // リソースが見つからない
          break;
        case 500:
          // サーバーエラー
          break;
      }
    }
    return Promise.reject(error);
  }
);

// リクエストインターセプター
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // トークンがある場合はヘッダーに追加
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);
