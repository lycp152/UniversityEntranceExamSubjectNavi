import type { Score, ScoreCalculationOptions, ScoreCalculationResult, ScoreContext } from './types';

export class ScoreCalculator {
  protected context: ScoreContext;

  constructor(context?: ScoreContext) {
    this.context = context || {};
  }

  /**
   * スコアの計算を実行
   */
  calculate(
    scores: { [key: string]: Score },
    options: ScoreCalculationOptions = {}
  ): ScoreCalculationResult {
    const { roundToDecimal = 2, useWeights = false } = options;
    let total = 0;
    let maxTotal = 0;

    // 各スコアの合計を計算
    Object.values(scores).forEach((score) => {
      const weight = useWeights ? score.weight ?? 1 : 1;
      total += score.value * weight;
      maxTotal += score.maxValue * weight;
    });

    // パーセンテージを計算
    const percentage = maxTotal > 0 ? (total / maxTotal) * 100 : 0;

    return {
      total: this.round(total, roundToDecimal),
      percentage: this.round(percentage, roundToDecimal),
      details: scores,
      ...(useWeights && { weightedScore: this.round(total, roundToDecimal) }),
    };
  }

  /**
   * 指定された小数点以下の桁数で四捨五入
   */
  protected round(value: number, decimals: number): number {
    const multiplier = Math.pow(10, decimals);
    return Math.round(value * multiplier) / multiplier;
  }

  /**
   * コンテキストを更新
   */
  updateContext(context: Partial<ScoreContext>): void {
    this.context = {
      ...this.context,
      ...context,
    };
  }
}
