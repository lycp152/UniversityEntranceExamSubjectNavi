/**
 * エラーの重要度の型定義
 */
export type Severity = "critical" | "error" | "warning" | "info";

/**
 * 操作の状態の型定義
 */
export type OperationStatus = "pending" | "running" | "completed" | "failed";

/**
 * 基本的な操作結果の型定義
 */
export interface OperationResult<T> {
  /** 操作が成功したかどうか */
  success: boolean;
  /** 操作の結果データ */
  data?: T;
  /** エラー情報 */
  error?: Error;
  /** 操作実行時のタイムスタンプ */
  timestamp: number;
}

/**
 * 操作の実行オプション
 */
export interface OperationOptions {
  /** タイムアウト時間（ミリ秒） */
  timeout?: number;
  /** リトライ回数 */
  retryCount?: number;
  /** リトライ間隔（ミリ秒） */
  retryDelay?: number;
}
