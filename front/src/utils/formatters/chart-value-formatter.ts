/**
 * スコアを表示用にフォーマットする
 */
export const formatScore = (score: number): string => {
  return score.toFixed(1);
};

/**
 * パーセンテージを表示用にフォーマットする
 */
export const formatPercentage = (percentage: number): string => {
  return `${(percentage * 100).toFixed(1)}%`;
};
