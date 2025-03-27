export const TEST_TYPES = {
  COMMON: "common",
  INDIVIDUAL: "individual",
} as const;

export const SCORE_CONSTRAINTS = {
  MIN_VALUE: 0,
  MAX_VALUE: 100,
  DEFAULT_DECIMAL_PLACES: 2,
} as const;

export interface BaseScore {
  value: number;
  maxValue: number;
}

export interface ScoreMetrics {
  score: number;
  percentage: number;
}

export interface BaseSubjectScore {
  [TEST_TYPES.COMMON]: BaseScore;
  [TEST_TYPES.INDIVIDUAL]: BaseScore;
}
