import { ScoreCalculator } from '../core/calculator';
import type { Score, ScoreCalculationResult } from '../core/types';
import type { BaseSubjectScore, SubjectScores } from '@/lib/types';

type TestType = 'commonTest' | 'secondTest';
type MaxTestType = `max${Capitalize<TestType>}`;

export class SubjectScoreCalculator extends ScoreCalculator {
  /**
   * 科目スコアを計算用の形式に変換
   */
  private convertToScores(subjectScore: BaseSubjectScore): { [key: string]: Score } {
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
  calculateTestTypeScore(subjects: SubjectScores, testType: TestType): ScoreCalculationResult {
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
  calculateCategoryScore(subjects: SubjectScores, category: string): ScoreCalculationResult {
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
