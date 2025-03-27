/**
 * HTTPメソッドの型定義
 */
export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

/**
 * HTTPリクエストの設定型定義
 */
export interface HttpRequestConfig {
  method: HttpMethod;
  headers?: Record<string, string>;
  body?: BodyInit | null;
  signal?: AbortSignal;
}

/**
 * HTTPレスポンスの共通型定義
 * @template T - レスポンスデータの型
 */
export interface HttpResponse<T> {
  data: T;
  status: number;
  message?: string;
  httpStatus: number;
  headers?: Record<string, string>;
}

/**
 * HTTPエラーレスポンスの共通型定義
 */
export interface HttpError {
  code: string;
  message: string;
  status: number;
  details?: Record<string, unknown>;
}
