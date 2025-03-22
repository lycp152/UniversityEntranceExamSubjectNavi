import type { TestTypeName } from "@/types/university/university";
import type { SubjectName } from "@/features/subjects/constants";
import type { ScoreMetrics } from "./score3";

export interface BaseScore {
  value: number;
  maxValue: number;
}

export interface SubjectScore {
  type: TestTypeName;
  value: number;
  subjectName: SubjectName;
}

export interface BaseSubjectScore {
  commonTest: number;
  secondTest: number;
}

export interface SubjectScores {
  [subject: string]: BaseSubjectScore;
}

export interface SubjectScoreDetail {
  subject: string;
  commonTest: ScoreMetrics;
  secondaryTest: ScoreMetrics;
  total: ScoreMetrics;
}

export interface SubjectScoreError {
  type: TestTypeName;
  code: string;
  message: string;
  subjectName: SubjectName;
}
