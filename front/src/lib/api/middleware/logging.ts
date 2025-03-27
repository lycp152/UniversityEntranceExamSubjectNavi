// APIリクエスト・レスポンスのロギングを行うインターセプター
// 開発環境でのデバッグを支援するためのログ出力を提供
import type { HttpRequestConfig } from "@/lib/api/types/http";
import { isDevelopment } from "@/lib/config/env";

export class LoggingInterceptor {
  // リクエストの内容をコンソールに出力
  // メソッド、ヘッダー、ボディの情報を階層的に表示
  async interceptRequest(
    config: HttpRequestConfig
  ): Promise<HttpRequestConfig> {
    if (isDevelopment) {
      console.group("API Request");
      console.log("Method:", config.method);
      console.log("Headers:", config.headers);
      console.log("Body:", config.body);
      console.groupEnd();
    }
    return config;
  }

  // レスポンスの内容をコンソールに出力
  // ステータス、ヘッダー、ボディの情報を階層的に表示
  // JSONレスポンスのパースを試み、失敗した場合はその旨を表示
  async interceptResponse(response: Response): Promise<Response> {
    if (isDevelopment) {
      console.group("API Response");
      console.log("Status:", response.status);
      console.log("Status Text:", response.statusText);
      console.log("Headers:", Object.fromEntries(response.headers.entries()));
      const clonedResponse = response.clone();
      try {
        const body = await clonedResponse.json();
        console.log("Body:", body);
      } catch {
        console.log("Body: Unable to parse JSON");
      }
      console.groupEnd();
    }
    return response;
  }
}

// シングルトンとしてインターセプターをエクスポート
export const loggingRequestInterceptor =
  new LoggingInterceptor().interceptRequest.bind(new LoggingInterceptor());
export const loggingResponseInterceptor =
  new LoggingInterceptor().interceptResponse.bind(new LoggingInterceptor());
