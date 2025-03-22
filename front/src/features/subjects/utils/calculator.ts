import {
  TestScore,
  ScoreMetrics,
  BaseSubjectScore,
  SubjectScores,
  SubjectScoreDetail,
  SCORE_CONSTRAINTS,
} from "@/types/score/score";
import {
  ScoreCalculationError,
  ScoreErrorCodes,
  createErrorMessage,
} from "@/features/subjects/errors/ScoreErorr";

export interface ScoreCalculatorOptions {
  roundToDecimal?: number;
}

/**
 * スコア計算の基本クラス
 */
export class ScoreCalculator {
  private readonly roundToDecimal: number;

  constructor(options: ScoreCalculatorOptions = {}) {
    this.roundToDecimal = options.roundToDecimal ?? 2;
  }

  /**
   * 基本的なスコアの計算
   */
  protected calculateBaseScore(score: TestScore, field?: string): ScoreMetrics {
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
  private validateScore(score: TestScore, field?: string): void {
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
        { value: subject.commonTest, maxValue: 100 },
        "commonTest"
      );
      const secondaryTest = this.calculateBaseScore(
        { value: subject.secondTest, maxValue: 100 },
        "secondTest"
      );

      const totalScore = commonTest.score + secondaryTest.score;
      const totalMaxScore = 200; // 共通テストと二次試験の満点の合計

      return {
        subject: "",
        commonTest,
        secondaryTest,
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
    testType: "commonTest" | "secondTest"
  ): number {
    return Object.values(subjects).reduce((total, subject) => {
      return total + subject[testType];
    }, 0);
  }
}
