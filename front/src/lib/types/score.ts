/**
 * テストの種別を定義
 */
export const TEST_TYPES = {
  COMMON: 'commonTest',
  INDIVIDUAL: 'individualTest',
} as const;

export type TestType = (typeof TEST_TYPES)[keyof typeof TEST_TYPES];

/**
 * スコアの制約
 */
export const SCORE_CONSTRAINTS = {
  MIN_VALUE: 0,
  MAX_PERCENTAGE: 100,
  DEFAULT_DECIMAL_PLACES: 2,
} as const;

/**
 * 基本的なスコアの型定義
 */
export interface BaseScore {
  readonly value: number;
  readonly maxValue: number;
}

/**
 * スコアの計算結果
 */
export interface ScoreMetrics {
  readonly score: number;
  readonly percentage: number;
}

/**
 * 科目スコアの基本構造
 */
export type BaseSubjectScore = {
  readonly [K in TestType]: BaseScore;
};

/**
 * 科目別スコアの詳細
 */
export interface SubjectScoreDetail {
  readonly subject: string;
  readonly commonTest: ScoreMetrics;
  readonly individualTest: ScoreMetrics;
  readonly total: ScoreMetrics;
}

/**
 * 科目スコアのマップ型
 */
export type SubjectScores = Readonly<Record<string, BaseSubjectScore>>;

/**
 * バリデーション結果の型
 */
export interface ValidationResult<T = unknown, E = ValidationError> {
  readonly isValid: boolean;
  readonly data?: T;
  readonly errors: readonly E[];
  readonly metadata?: {
    readonly validatedAt: number;
    readonly rules: readonly string[];
    readonly failureDetails?: Record<string, unknown>;
  };
}

/**
 * バリデーションエラーの型
 */
export interface ValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
}

/**
 * チャート表示用のスコアデータ
 */
export interface ChartScore {
  readonly name: string;
  readonly value: number;
  readonly category: string;
  readonly percentage: number;
}

/**
 * チャートデータセット
 */
export interface ChartData {
  readonly detailedData: readonly ChartScore[];
  readonly outerData: readonly ChartScore[];
}
