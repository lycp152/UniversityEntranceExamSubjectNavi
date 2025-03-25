import type { ErrorSeverity } from "@/types/errors/categories";

/**
 * エラーコンテキストのインターフェース
 */
export interface ErrorContext {
  errorType: string;
  timestamp: number;
  severity: ErrorSeverity;
  recoveryAttempts: number;
  stackTrace?: string;
  operationDetails: {
    type: string;
    phase: string;
    duration?: number;
  };
  systemState: {
    memoryUsage: number;
    cacheSize: number;
    activeOperations: number;
  };
}

/**
 * リカバリー結果のインターフェース
 */
export interface RecoveryResult {
  success: boolean;
  attempts: number;
  duration: number;
  error?: Error;
  recoverySteps: string[];
}
