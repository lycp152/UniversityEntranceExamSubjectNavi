import type { ApiResponse, ApiClientConfig, RequestConfig } from "@/types/api";
import {
  ApiClientError,
  NetworkError,
  TimeoutError,
} from "@/types/errors/client";
import { InterceptorManager } from "@/lib/api/middleware";
import { ENV } from "@/lib/config/env";
import { API_ERROR_CODES, ERROR_MESSAGES } from "@/types/errors/codes";
import type {
  RequestInterceptor,
  ResponseInterceptor,
  ErrorInterceptor,
} from "@/lib/api/middleware";

export class ApiClient {
  private readonly baseURL: string;
  private readonly defaultHeaders: Record<string, string>;
  private readonly timeout: number;
  private readonly interceptors: InterceptorManager;

  constructor(config: ApiClientConfig) {
    this.baseURL = config.baseURL;
    this.defaultHeaders = {
      "Content-Type": "application/json",
      ...config.defaultHeaders,
    };
    this.timeout = config.timeout ?? ENV.API.TIMEOUT;
    this.interceptors = new InterceptorManager();

    // デフォルトのエラーインターセプターを設定
    this.setupDefaultInterceptors();
  }

  private setupDefaultInterceptors(): void {
    this.interceptors.addErrorInterceptor(async (error) => {
      if (error instanceof Response) {
        const data = await error.json();
        throw new ApiClientError({
          code: data.code ?? API_ERROR_CODES.INTERNAL_SERVER_ERROR,
          message:
            data.message ??
            ERROR_MESSAGES[API_ERROR_CODES.INTERNAL_SERVER_ERROR],
          status: error.status,
          details: data.details,
        });
      }
      throw error;
    });
  }

  public getInterceptorManager(): InterceptorManager {
    return this.interceptors;
  }

  public addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.interceptors.addRequestInterceptor(interceptor);
  }

  public addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.interceptors.addResponseInterceptor(interceptor);
  }

  public addErrorInterceptor(interceptor: ErrorInterceptor): void {
    this.interceptors.addErrorInterceptor(interceptor);
  }

  async request<T>(
    path: string,
    config: RequestConfig
  ): Promise<ApiResponse<T>> {
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

      const processedResponse = await this.interceptors.runResponseInterceptors(
        response
      );

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

      if (error instanceof DOMException && error.name === "AbortError") {
        throw new TimeoutError();
      }

      throw new NetworkError();
    }
  }

  async get<T>(
    path: string,
    config?: Omit<RequestConfig, "method">
  ): Promise<T> {
    const response = await this.request<T>(path, { ...config, method: "GET" });
    return response.data;
  }

  async post<T>(
    path: string,
    data?: unknown,
    config?: Omit<RequestConfig, "method" | "body">
  ): Promise<T> {
    const response = await this.request<T>(path, {
      ...config,
      method: "POST",
      body: data ? JSON.stringify(data) : null,
    });
    return response.data;
  }

  async put<T>(
    path: string,
    data?: unknown,
    config?: Omit<RequestConfig, "method" | "body">
  ): Promise<T> {
    const response = await this.request<T>(path, {
      ...config,
      method: "PUT",
      body: data ? JSON.stringify(data) : null,
    });
    return response.data;
  }

  async delete<T>(
    path: string,
    config?: Omit<RequestConfig, "method">
  ): Promise<T> {
    const response = await this.request<T>(path, {
      ...config,
      method: "DELETE",
    });
    return response.data;
  }
}

export const apiClient = new ApiClient({
  baseURL: ENV.API.BASE_URL,
});
