import type { TestTypeName } from "@/lib/types/university/university";
import type { SubjectName } from "@/lib/constants/subject";
import type { PieData } from "./chart";

export const TEST_TYPES = {
  COMMON: "common",
  INDIVIDUAL: "individual",
} as const;

export type TestType = (typeof TEST_TYPES)[keyof typeof TEST_TYPES];

export interface ScoreMetrics {
  score: number;
  percentage: number;
}

export interface Score {
  value: number;
  maxValue: number;
  weight: number;
  type: TestTypeName;
  subjectName: SubjectName;
  percentage: number;
}

export interface BaseSubjectScore {
  commonTest: number;
  secondTest: number;
}

export interface SubjectScores {
  [subject: string]: BaseSubjectScore;
}

export type SubjectScore = PieData & {
  percentage: number;
  category: string;
  displayName?: string;
};

export type SubjectTableData = {
  subject: string;
  commonTest: {
    score: number;
    percentage: number;
  };
  secondaryTest: {
    score: number;
    percentage: number;
  };
  total: {
    score: number;
    percentage: number;
  };
};

export type ExtractedScore = {
  type: "success" | "error";
  subjectName: string;
  value?: number;
  message?: string;
};

export interface ScoreValidationError {
  code: string;
  message: string;
  field?: string;
}

export interface CategoryScore {
  category: SubjectCategory;
  common: ScoreMetrics;
  individual: ScoreMetrics;
  total: ScoreMetrics;
}

export const SUBJECT_CATEGORIES = {
  ENGLISH: "英語",
  MATH: "数学",
  JAPANESE: "国語",
  SCIENCE: "理科",
  SOCIAL: "社会",
} as const;

export type SubjectCategory =
  (typeof SUBJECT_CATEGORIES)[keyof typeof SUBJECT_CATEGORIES];
