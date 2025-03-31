/**
 * APIクライアントの設定と初期化を行うモジュール
 * 認証とロギングのインターセプターを設定し、APIクライアントの基本設定を提供
 */

import { apiClient } from '@/lib/api/client';
import { authInterceptor } from '@/lib/api/middleware/auth';
import {
  loggingRequestInterceptor,
  loggingResponseInterceptor,
} from '@/lib/api/middleware/logging';

/**
 * ページネーションのパラメータを定義するインターフェース
 *
 * @interface PaginationParams
 * @property {number} page - 現在のページ番号（1から開始）
 * @property {number} limit - 1ページあたりのアイテム数
 */
export interface PaginationParams {
  page: number;
  limit: number;
}

/**
 * APIクライアントの初期設定を行う関数
 * 認証とロギングのインターセプターを設定し、APIクライアントの基本設定を完了
 *
 * @function setupApiClient
 * @description
 * - 認証インターセプターを追加して、すべてのリクエストに認証トークンを付加
 * - 開発環境の場合、リクエストとレスポンスのロギングインターセプターを追加
 */
export function setupApiClient(): void {
  // 認証インターセプターを追加
  apiClient.addRequestInterceptor(authInterceptor);

  // ロギングインターセプターを追加（開発環境のみ）
  apiClient.addRequestInterceptor(loggingRequestInterceptor);
  apiClient.addResponseInterceptor(loggingResponseInterceptor);
}
