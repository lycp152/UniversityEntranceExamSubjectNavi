import type { HttpRequestConfig } from "@/lib/api/types/http";

// APIリクエスト・レスポンスの加工処理を定義するインターフェース
export type RequestInterceptor = (
  config: HttpRequestConfig
) => Promise<HttpRequestConfig>;

// レスポンスを加工するインターセプター
export type ResponseInterceptor = (response: Response) => Promise<Response>;

// エラーハンドリングを行うインターセプター
export type ErrorInterceptor = (error: unknown) => Promise<never>;

// インターセプターを管理するクラス
// リクエスト、レスポンス、エラーの各段階で実行される処理を管理
export class InterceptorManager {
  private readonly requestInterceptors: RequestInterceptor[] = [];
  private readonly responseInterceptors: ResponseInterceptor[] = [];
  private readonly errorInterceptors: ErrorInterceptor[] = [];

  // 各種インターセプターを登録するメソッド
  addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor);
  }

  addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.push(interceptor);
  }

  addErrorInterceptor(interceptor: ErrorInterceptor): void {
    this.errorInterceptors.push(interceptor);
  }

  // リクエストインターセプターを順次実行
  // 前のインターセプターの結果を次のインターセプターに渡す
  async runRequestInterceptors(
    config: HttpRequestConfig
  ): Promise<HttpRequestConfig> {
    return this.requestInterceptors.reduce(
      async (promise, interceptor) => interceptor(await promise),
      Promise.resolve({ ...config })
    );
  }

  // レスポンスインターセプターを順次実行
  // 前のインターセプターの結果を次のインターセプターに渡す
  async runResponseInterceptors(response: Response): Promise<Response> {
    return this.responseInterceptors.reduce(
      async (promise, interceptor) => interceptor(await promise),
      Promise.resolve(response)
    );
  }

  // エラーインターセプターを実行
  // エラーが解決されるまで順次実行し、最終的に解決できない場合は元のエラーを投げる
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
