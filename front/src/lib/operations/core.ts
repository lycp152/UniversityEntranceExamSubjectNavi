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
  success: boolean;
  data?: T;
  error?: Error;
  timestamp: number;
}
