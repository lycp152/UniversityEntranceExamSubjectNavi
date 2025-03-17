import { apiClient } from "@/api/client";
import { authInterceptor } from "../interceptors/auth";
import {
  loggingRequestInterceptor,
  loggingResponseInterceptor,
} from "../interceptors/logging";

export function setupApiClient(): void {
  // 認証インターセプターを追加
  apiClient.addRequestInterceptor(authInterceptor);

  // ロギングインターセプターを追加（開発環境のみ）
  apiClient.addRequestInterceptor(loggingRequestInterceptor);
  apiClient.addResponseInterceptor(loggingResponseInterceptor);
}
