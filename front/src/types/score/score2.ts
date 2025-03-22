import type { ValidationResult } from "@/types/validation/validation";
import type { TestTypeName } from "@/types/university/university";
import type { SubjectName } from "@/features/subjects/constants";

export const TEST_TYPES = {
  COMMON: "common",
  INDIVIDUAL: "individual",
} as const;

export const SCORE_CONSTRAINTS = {
  MIN_VALUE: 0,
  MAX_VALUE: 100,
} as const;

/**
 * テストスコアの基本型
 */
export interface TestScore {
  readonly value: number;
  readonly maxValue: number;
}

/**
 * 科目スコアの型
 */
export interface SubjectScore {
  readonly [TEST_TYPES.COMMON]: TestScore;
  readonly [TEST_TYPES.INDIVIDUAL]: TestScore;
}

/**
 * 基本科目スコアの型
 */
export interface BaseSubjectScore {
  commonTest: number;
  secondTest: number;
}

/**
 * 科目スコアの型
 */
export interface SubjectScores {
  [subject: string]: BaseSubjectScore;
}

/**
 * 詳細な科目スコアの型
 */
export interface DetailedSubjectScore {
  type: TestTypeName;
  value: number;
  maxValue: number;
  weight: number;
  subjectName: SubjectName;
  isValid: boolean;
}

/**
 * スコア計算結果の型
 */
export interface ScoreCalculationResult {
  readonly total: number;
  readonly maxTotal: number;
  readonly percentage: number;
  readonly isValid: boolean;
  readonly validationResult?: ValidationResult<SubjectScore>;
  readonly computedAt: number;
}

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

/**
 * バリデーション失敗タイプ
 */
export const enum ValidationFailureType {
  INVALID_FORMAT = "INVALID_FORMAT",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  CACHE_ERROR = "CACHE_ERROR",
  CONCURRENT_ERROR = "CONCURRENT_ERROR",
}

/**
 * キャッシュの設定
 */
export const CACHE_CONFIG = {
  /** キャッシュの有効期限（5分） */
  TTL: 5 * 60 * 1000,
  /** デバウンス時間（100ms） */
  DEBOUNCE_TIME: 100,
  /** 最大同時実行数 */
  MAX_CONCURRENT: 5,
  /** クリーンアップ間隔（1時間） */
  CLEANUP_INTERVAL: 60 * 60 * 1000,
} as const;

/**
 * リトライ設定
 */
export const RETRY_CONFIG = {
  /** 最大試行回数 */
  MAX_ATTEMPTS: 3,
  /** 試行間隔（ミリ秒） */
  DELAY_MS: 100,
  /** 指数バックオフの基数 */
  BACKOFF_BASE: 2,
} as const;
