/**
 * 基本的なスコアの型定義
 */
export interface Score {
  value: number;
  maxValue: number;
  weight?: number;
}

/**
 * スコア計算のオプション
 */
export interface ScoreCalculationOptions {
  roundToDecimal?: number;
  useWeights?: boolean;
}

/**
 * スコア計算の結果
 */
export interface ScoreCalculationResult {
  total: number;
  percentage: number;
  weightedScore?: number;
  details?: {
    [key: string]: Score;
  };
}

/**
 * スコア計算のコンテキスト
 */
export interface ScoreContext {
  minValue?: number;
  maxValue?: number;
  weights?: {
    [key: string]: number;
  };
}
