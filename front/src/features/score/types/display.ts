import type { ScoreMetrics, SubjectCategory } from "@/types/score";

export type SubjectTableData = {
  subject: string;
  commonTest: ScoreMetrics;
  secondaryTest: ScoreMetrics;
  total: ScoreMetrics;
};

export interface CategoryScore {
  category: SubjectCategory;
  common: ScoreMetrics;
  individual: ScoreMetrics;
  total: ScoreMetrics;
}
