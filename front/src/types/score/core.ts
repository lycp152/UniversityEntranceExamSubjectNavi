import type { TestTypeName } from "@/types/university/university";
import type { SubjectName } from "@/constants/subjects";

export interface Score {
  value: number;
  maxValue: number;
  weight: number;
  type: TestTypeName;
  subjectName: SubjectName;
  percentage: number;
}

export interface ScoreValidationError {
  code: string;
  message: string;
  field?: string;
}

export type ExtractedScore = {
  type: "success" | "error";
  subjectName: string;
  value?: number;
  message?: string;
};
