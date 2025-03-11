import type { TestTypeName } from "@/lib/types/university/university";
import type {
  SubjectName,
  SubjectCategory,
} from "@/lib/constants/subject/subjects";

export interface BaseScore {
  value: number;
  maxValue: number;
  weight: number;
}

export interface SubjectScore extends BaseScore {
  type: TestTypeName;
  subjectName: SubjectName;
  category: SubjectCategory;
}

export interface SubjectMetrics {
  score: number;
  percentage: number;
  category: SubjectCategory;
}

export interface SubjectValidationResult {
  isValid: boolean;
  errors: SubjectValidationError[];
  metadata?: Record<string, unknown>;
}

export interface SubjectValidationError {
  code: string;
  message: string;
  field: string;
  severity: "error" | "warning" | "info";
}
