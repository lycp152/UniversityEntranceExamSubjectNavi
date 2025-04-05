/**
 * APIクライアントの設定型定義
 * APIクライアントの初期化に必要な設定パラメータを定義
 *
 * @module api-client-config
 * @description
 * - ベースURLの設定
 * - デフォルトヘッダーの設定
 * - タイムアウト時間の設定
 */

export interface ApiClientConfig {
  /** APIのベースURL（例：'https://api.example.com/v1'） */
  baseURL: string;
  /** デフォルトのHTTPヘッダー（認証トークンなど） */
  defaultHeaders?: Record<string, string>;
  /** リクエストのタイムアウト時間（ミリ秒、デフォルト：5000ms） */
  timeout?: number;
}
