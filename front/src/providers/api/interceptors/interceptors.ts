import type { RequestConfig } from "@/api/client/types";

export type RequestInterceptor = (
  config: RequestConfig
) => Promise<RequestConfig>;
export type ResponseInterceptor = (response: Response) => Promise<Response>;
export type ErrorInterceptor = (error: unknown) => Promise<never>;

export class InterceptorManager {
  private readonly requestInterceptors: RequestInterceptor[] = [];
  private readonly responseInterceptors: ResponseInterceptor[] = [];
  private readonly errorInterceptors: ErrorInterceptor[] = [];

  addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor);
  }

  addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.push(interceptor);
  }

  addErrorInterceptor(interceptor: ErrorInterceptor): void {
    this.errorInterceptors.push(interceptor);
  }

  async runRequestInterceptors(config: RequestConfig): Promise<RequestConfig> {
    let currentConfig = { ...config };
    for (const interceptor of this.requestInterceptors) {
      currentConfig = await interceptor(currentConfig);
    }
    return currentConfig;
  }

  async runResponseInterceptors(response: Response): Promise<Response> {
    let currentResponse = response;
    for (const interceptor of this.responseInterceptors) {
      currentResponse = await interceptor(currentResponse);
    }
    return currentResponse;
  }

  async runErrorInterceptors(error: unknown): Promise<never> {
    for (const interceptor of this.errorInterceptors) {
      try {
        return await interceptor(error);
      } catch (e) {
        error = e;
      }
    }
    return Promise.reject(
      error instanceof Error ? error : new Error(String(error))
    );
  }
}
