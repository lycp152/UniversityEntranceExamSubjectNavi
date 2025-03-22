/**
 * 基本操作結果の型
 */
export interface BaseOperationResult<T> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: Error;
  readonly timestamp: number;
}

/**
 * キャッシュ操作結果の型
 */
export interface CacheOperationResult<T> extends BaseOperationResult<T> {
  readonly cacheKey?: string;
  readonly cacheHit: boolean;
}

/**
 * バリデーション操作結果の型
 */
export interface ValidationOperationResult<T> extends BaseOperationResult<T> {
  readonly validationContext?: {
    readonly rules: readonly string[];
    readonly validatedAt: number;
    readonly recoveryAttempted?: boolean;
  };
}

/**
 * 操作コンテキストの型
 */
export interface OperationContext {
  readonly startTime: number;
  readonly queueLength: number;
  readonly concurrentOperations: number;
  readonly phase?: string;
  readonly metadata?: Record<string, unknown>;
}
