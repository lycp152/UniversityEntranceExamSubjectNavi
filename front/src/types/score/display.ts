import type { ScoreMetrics, SubjectCategory } from "./score";

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
