// 共通の型定義
export interface BaseOperationResult<T> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: Error;
  readonly timestamp: number;
}

export interface OperationContext {
  readonly startTime: number;
  readonly queueLength: number;
  readonly concurrentOperations: number;
  readonly phase?: string;
  readonly metadata?: Record<string, unknown>;
}
