import { apiClient } from "@/lib/api/client";
import { authInterceptor } from "@/lib/api/middleware/auth";
import {
  loggingRequestInterceptor,
  loggingResponseInterceptor,
} from "@/lib/api/middleware/logging";

export interface PaginationParams {
  page: number;
  limit: number;
}

export function setupApiClient(): void {
  // 認証インターセプターを追加
  apiClient.addRequestInterceptor(authInterceptor);

  // ロギングインターセプターを追加（開発環境のみ）
  apiClient.addRequestInterceptor(loggingRequestInterceptor);
  apiClient.addResponseInterceptor(loggingResponseInterceptor);
}
