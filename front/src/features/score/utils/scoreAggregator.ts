import type { Score } from "@/types/score";
import type { CategoryScore } from "@/features/score/types/display";
import { SUBJECTS } from "@/constants/subjects";
import type { SubjectCategory } from "@/constants/subjects";

const SUBJECT_TO_CATEGORY_MAP: Record<string, SubjectCategory> = {
  [SUBJECTS.ENGLISH_R]: "英語",
  [SUBJECTS.ENGLISH_L]: "英語",
  [SUBJECTS.MATH]: "数学",
  [SUBJECTS.JAPANESE]: "国語",
  [SUBJECTS.SCIENCE]: "理科",
  [SUBJECTS.SOCIAL]: "地歴公",
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
          existing.secondary = {
            score: score.value,
            percentage: score.percentage,
          };
        }
        existing.total = {
          score:
            (existing.common?.score || 0) + (existing.secondary?.score || 0),
          percentage:
            (existing.common?.percentage || 0) +
            (existing.secondary?.percentage || 0),
        };
      } else {
        categoryMap.set(category, {
          category,
          common:
            score.type === "共通"
              ? { score: score.value, percentage: score.percentage }
              : { score: 0, percentage: 0 },
          secondary:
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
