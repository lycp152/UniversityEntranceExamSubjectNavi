import type { TestTypeName } from "@/types/universities/university";
import type { SubjectName, SubjectCategory } from "@/constants/subjects";

// 基本的なスコア型
export interface BaseScore {
  readonly value: number;
  readonly maxValue: number;
  readonly weight: number;
}

// 科目スコア型
export interface SubjectScore extends BaseScore {
  readonly type: TestTypeName;
  readonly subjectName: SubjectName;
  readonly category: SubjectCategory;
  readonly timestamp?: number;
}

// 科目メトリクス型
export interface SubjectMetrics {
  readonly score: number;
  readonly percentage: number;
  readonly category: SubjectCategory;
  readonly timestamp: number;
  readonly metadata?: {
    readonly processingTime?: number;
    readonly cacheHit?: boolean;
    readonly lastUpdated?: number;
  };
}

// バリデーション結果型
export interface ValidationResult {
  readonly isValid: boolean;
  readonly errors: ValidationError[];
  readonly metadata?: {
    readonly timestamp: number;
    readonly validatedFields: string[];
    readonly processingTime?: number;
  };
}

// バリデーションエラー型
export interface ValidationError {
  readonly code: string;
  readonly message: string;
  readonly field: string;
  readonly severity: "error" | "warning" | "info";
  readonly context?: Record<string, unknown>;
}

// 計算結果型
export interface CalculationResult {
  readonly metrics: SubjectMetrics[];
  readonly timestamp: number;
  readonly metadata: {
    readonly processingTime: number;
    readonly cacheHit: boolean;
    readonly calculationMethod: string;
  };
}

// キャッシュエントリ型
export interface CacheEntry<T> {
  readonly data: T;
  readonly timestamp: number;
  readonly lastAccess: number;
  readonly accessCount: number;
  readonly metadata?: Record<string, unknown>;
}

// メトリクス統計型
export interface MetricsStats {
  readonly totalEntries: number;
  readonly oldestEntry: number;
  readonly mostAccessed: number;
  readonly averageProcessingTime: number;
  readonly cacheHitRate: number;
}
