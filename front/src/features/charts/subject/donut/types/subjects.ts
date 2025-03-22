import type { TestTypeName } from "@/types/university/university";
import type { SubjectName } from "@/features/subjects/constants";

export interface SubjectScore {
  type: TestTypeName;
  value: number;
  subjectName: SubjectName;
}

export interface SubjectScoreError {
  type: TestTypeName;
  code: string;
  message: string;
  subjectName: SubjectName;
}

export interface ScoreEntry {
  commonTest: number;
  secondTest: number;
}
