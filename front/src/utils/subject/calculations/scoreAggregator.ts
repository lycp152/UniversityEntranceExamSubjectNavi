import type {
  Score,
  ScoreMetrics,
  CategoryScore,
  SubjectCategory,
} from '../../../../types/subject/score';
import { calculatePercentage } from './percentageCalculator';
import { SUBJECTS, SUBJECT_CATEGORIES } from '../../../../constants/subject/subjects';

const SUBJECT_TO_CATEGORY_MAP: Record<string, SubjectCategory> = {
  [SUBJECTS.ENGLISH_LISTENING]: SUBJECT_CATEGORIES.ENGLISH,
  [SUBJECTS.ENGLISH_READING]: SUBJECT_CATEGORIES.ENGLISH,
  [SUBJECTS.MATH]: SUBJECT_CATEGORIES.MATH,
  [SUBJECTS.JAPANESE]: SUBJECT_CATEGORIES.JAPANESE,
  [SUBJECTS.SCIENCE]: SUBJECT_CATEGORIES.SCIENCE,
  [SUBJECTS.SOCIAL]: SUBJECT_CATEGORIES.SOCIAL,
} as const;

export class ScoreAggregator {
  aggregateByCategory(scores: Score[]): CategoryScore[] {
    const categoryMap = new Map<SubjectCategory, Score[]>();

    scores.forEach((score) => {
      const category = SUBJECT_TO_CATEGORY_MAP[score.subjectName];
      const categoryScores = categoryMap.get(category) || [];
      categoryScores.push(score);
      categoryMap.set(category, categoryScores);
    });

    return Array.from(categoryMap.entries()).map(([category, categoryScores]) => ({
      category,
      common: this.calculateMetrics(categoryScores.filter((s) => s.type === '共通')),
      individual: this.calculateMetrics(categoryScores.filter((s) => s.type === '二次')),
      total: this.calculateMetrics(categoryScores),
    }));
  }

  private calculateMetrics(scores: Score[]): ScoreMetrics {
    const totalValue = scores.reduce((sum, score) => sum + score.value * score.weight, 0);
    const maxValue = scores.reduce((sum, score) => sum + score.maxValue * score.weight, 0);

    return {
      score: totalValue,
      percentage: calculatePercentage(totalValue, maxValue),
    };
  }
}
