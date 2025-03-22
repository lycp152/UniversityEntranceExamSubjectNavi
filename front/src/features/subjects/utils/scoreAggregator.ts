import type {
  CategoryScore,
  SubjectCategory,
  Score,
} from "@/types/score/score3";
import {
  SUBJECTS,
  SUBJECT_CATEGORIES,
} from "@/features/subjects/constants/subjects";

const SUBJECT_TO_CATEGORY_MAP: Record<string, SubjectCategory> = {
  [SUBJECTS.ENGLISH]: SUBJECT_CATEGORIES.ENGLISH,
  [SUBJECTS.MATH]: SUBJECT_CATEGORIES.MATH,
  [SUBJECTS.SCIENCE]: SUBJECT_CATEGORIES.SCIENCE,
  [SUBJECTS.SOCIAL]: SUBJECT_CATEGORIES.SOCIAL,
} as const;

export class ScoreAggregator {
  aggregateByCategory(scores: Score[]): CategoryScore[] {
    const categoryMap = new Map<SubjectCategory, CategoryScore>();

    scores.forEach((score) => {
      const category = SUBJECT_TO_CATEGORY_MAP[score.subjectName];
      const existing = categoryMap.get(category);
      if (existing) {
        if (score.type === "共通") {
          existing.common = {
            score: score.value,
            percentage: score.percentage,
          };
        } else {
          existing.individual = {
            score: score.value,
            percentage: score.percentage,
          };
        }
        existing.total = {
          score:
            (existing.common?.score || 0) + (existing.individual?.score || 0),
          percentage:
            (existing.common?.percentage || 0) +
            (existing.individual?.percentage || 0),
        };
      } else {
        categoryMap.set(category, {
          category,
          common:
            score.type === "共通"
              ? { score: score.value, percentage: score.percentage }
              : { score: 0, percentage: 0 },
          individual:
            score.type === "二次"
              ? { score: score.value, percentage: score.percentage }
              : { score: 0, percentage: 0 },
          total: { score: score.value, percentage: score.percentage },
        });
      }
    });

    return Array.from(categoryMap.values());
  }
}
