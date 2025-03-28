import type { ScoreMetrics } from "@/types/score";
import type { SubjectCategory } from "@/constants/subjects";
export type SubjectTableData = {
  subject: string;
  commonTest: ScoreMetrics;
  secondaryTest: ScoreMetrics;
  total: ScoreMetrics;
};

export interface CategoryScore {
  category: SubjectCategory;
  common: ScoreMetrics;
  secondary: ScoreMetrics;
  total: ScoreMetrics;
}
