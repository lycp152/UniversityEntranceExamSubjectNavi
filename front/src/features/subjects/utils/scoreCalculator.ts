import type {
  Score,
  ScoreCalculationOptions,
  ScoreCalculationResult,
  ScoreContext,
} from "../types/score";
import type { BaseSubjectScore, SubjectScores } from "@/types/score/score";

type TestType = "commonTest" | "secondTest";

/**
 * 基本的なスコア計算機能を提供する基底クラス
 */
export class BaseScoreCalculator {
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

/**
 * 科目スコアの計算に特化したクラス
 */
export class SubjectScoreCalculator extends BaseScoreCalculator {
  /**
   * 科目スコアを計算用の形式に変換
   */
  private convertToScores(subjectScore: BaseSubjectScore): {
    [key: string]: Score;
  } {
    return {
      commonTest: {
        value: subjectScore.commonTest,
        maxValue: 0,
      },
      secondTest: {
        value: subjectScore.secondTest,
        maxValue: 0,
      },
    };
  }

  /**
   * 単一科目のスコアを計算
   */
  calculateSubjectScore(score: BaseSubjectScore): ScoreCalculationResult {
    const scores = this.convertToScores(score);
    return this.calculate(scores);
  }

  /**
   * 全科目の合計スコアを計算
   */
  calculateTotalScore(subjects: SubjectScores): ScoreCalculationResult {
    const allScores: { [key: string]: Score } = {};

    Object.entries(subjects).forEach(([subject, score]) => {
      const subjectScores = this.convertToScores(score);
      Object.entries(subjectScores).forEach(([testType, scoreData]) => {
        allScores[`${subject}_${testType}`] = scoreData;
      });
    });

    return this.calculate(allScores);
  }

  /**
   * テスト種別ごとの合計スコアを計算
   */
  calculateTestTypeScore(
    subjects: SubjectScores,
    testType: TestType
  ): ScoreCalculationResult {
    const scores: { [key: string]: Score } = {};

    Object.entries(subjects).forEach(([subject, score]) => {
      scores[subject] = {
        value: score[testType],
        maxValue: 0,
      };
    });

    return this.calculate(scores);
  }

  /**
   * カテゴリー別の合計スコアを計算
   */
  calculateCategoryScore(
    subjects: SubjectScores,
    category: string
  ): ScoreCalculationResult {
    const categorySubjects = Object.entries(subjects)
      .filter(([subject]) => subject.startsWith(category))
      .reduce<SubjectScores>((acc, [subject, score]) => {
        if (Object.hasOwn(subjects, subject)) {
          acc[subject as keyof SubjectScores] = score;
        }
        return acc;
      }, {} as SubjectScores);

    return this.calculateTotalScore(categorySubjects);
  }
}
