import type { TestTypeName } from "@/types/universities/university";
import type { SubjectName } from "@/types/subjects";

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
