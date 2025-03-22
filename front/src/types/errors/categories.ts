/**
 * エラーの重要度の型定義
 */
export type ErrorSeverity = "critical" | "error" | "warning" | "info";

/**
 * エラーのカテゴリの型定義
 */
export type ErrorCategory =
  | "validation"
  | "business"
  | "system"
  | "network"
  | "security"
  | "performance";
