import {
  BaseScore,
  ScoreMetrics,
  BaseSubjectScore,
  SubjectScores,
  SubjectScoreDetail,
  TEST_TYPES,
  SCORE_CONSTRAINTS,
} from "../../types/score";
import {
  ScoreCalculationError,
  ScoreErrorCodes,
  createErrorMessage,
} from "../errors/score";

export interface ScoreCalculatorOptions {
  roundToDecimal?: number;
}

/**
 * スコア計算の基本クラス
 */
export class ScoreCalculator {
  private readonly roundToDecimal: number;

  constructor(options: ScoreCalculatorOptions = {}) {
    this.roundToDecimal =
      options.roundToDecimal ?? SCORE_CONSTRAINTS.DEFAULT_DECIMAL_PLACES;
  }

  /**
   * 基本的なスコアの計算
   */
  protected calculateBaseScore(score: BaseScore, field?: string): ScoreMetrics {
    try {
      this.validateScore(score, field);
      return {
        score: score.value,
        percentage: this.calculatePercentage(score.value, score.maxValue),
      };
    } catch (error) {
      throw new ScoreCalculationError(
        createErrorMessage(ScoreErrorCodes.CALCULATION_ERROR, field),
        field,
        { error: error instanceof Error ? error.message : "不明なエラー" }
      );
    }
  }

  /**
   * スコアの検証
   */
  private validateScore(score: BaseScore, field?: string): void {
    if (score.value < SCORE_CONSTRAINTS.MIN_VALUE) {
      throw new ScoreCalculationError(
        createErrorMessage(ScoreErrorCodes.NEGATIVE_SCORE, field),
        field
      );
    }
    if (score.value > score.maxValue) {
      throw new ScoreCalculationError(
        createErrorMessage(ScoreErrorCodes.MAX_SCORE_EXCEEDED, field),
        field
      );
    }
  }

  /**
   * パーセンテージの計算
   */
  protected calculatePercentage(value: number, maxValue: number): number {
    if (maxValue === 0) return 0;
    const percentage = (value / maxValue) * 100;
    return this.round(percentage);
  }

  /**
   * 数値の丸め処理
   */
  protected round(value: number): number {
    const multiplier = Math.pow(10, this.roundToDecimal);
    return Math.round(value * multiplier) / multiplier;
  }

  /**
   * 科目スコアの計算
   */
  calculateSubjectScore(subject: BaseSubjectScore): SubjectScoreDetail {
    try {
      const commonTest = this.calculateBaseScore(
        subject[TEST_TYPES.COMMON],
        TEST_TYPES.COMMON
      );
      const individualTest = this.calculateBaseScore(
        subject[TEST_TYPES.INDIVIDUAL],
        TEST_TYPES.INDIVIDUAL
      );

      const totalScore = commonTest.score + individualTest.score;
      const totalMaxScore =
        subject[TEST_TYPES.COMMON].maxValue +
        subject[TEST_TYPES.INDIVIDUAL].maxValue;

      return {
        subject: "",
        [TEST_TYPES.COMMON]: commonTest,
        [TEST_TYPES.INDIVIDUAL]: individualTest,
        total: {
          score: totalScore,
          percentage: this.calculatePercentage(totalScore, totalMaxScore),
        },
      };
    } catch (error) {
      if (error instanceof ScoreCalculationError) {
        throw error;
      }
      throw new ScoreCalculationError(
        createErrorMessage(ScoreErrorCodes.CALCULATION_ERROR),
        undefined,
        { error: error instanceof Error ? error.message : "不明なエラー" }
      );
    }
  }

  /**
   * 全科目の合計スコアを計算
   */
  calculateTotalScores(
    subjects: SubjectScores
  ): Record<string, SubjectScoreDetail> {
    try {
      const results: Record<string, SubjectScoreDetail> = {};

      for (const [subject, score] of Object.entries(subjects)) {
        try {
          results[subject] = {
            ...this.calculateSubjectScore(score),
            subject,
          };
        } catch (error) {
          throw new ScoreCalculationError(
            createErrorMessage(ScoreErrorCodes.CALCULATION_ERROR, subject),
            subject,
            { error: error instanceof Error ? error.message : "不明なエラー" }
          );
        }
      }

      return results;
    } catch (error) {
      throw new ScoreCalculationError(
        createErrorMessage(ScoreErrorCodes.CALCULATION_ERROR),
        undefined,
        { error: error instanceof Error ? error.message : "不明なエラー" }
      );
    }
  }

  /**
   * テスト種別ごとの合計を計算
   */
  calculateTestTypeTotal(
    subjects: SubjectScores,
    testType: keyof typeof TEST_TYPES
  ): number {
    return Object.values(subjects).reduce((total, subject) => {
      return total + subject[TEST_TYPES[testType]].value;
    }, 0);
  }
}
