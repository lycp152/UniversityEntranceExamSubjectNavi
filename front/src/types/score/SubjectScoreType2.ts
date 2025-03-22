import type { TestTypeName } from "@/types/university/university";
import type { SubjectName } from "@/features/subjects/constants";

export interface SubjectScore {
  type: TestTypeName;
  value: number;
  subjectName: SubjectName;
}

export interface Subject {
  id: number;
  universityId: number;
  departmentId: number;
  majorId: number;
  admissionScheduleId: number;
  academicYear: number;
  subjectId: number;
  universityName: string;
  department: string;
  major: string;
  admissionSchedule: string;
  enrollment: number;
  rank: number;
  subjects: {
    英語L: { commonTest: number; secondTest: number };
    英語R: { commonTest: number; secondTest: number };
    数学: { commonTest: number; secondTest: number };
    国語: { commonTest: number; secondTest: number };
    理科: { commonTest: number; secondTest: number };
    地歴公: { commonTest: number; secondTest: number };
  };
}

export interface BaseSubjectScore {
  commonTest: number;
  secondTest: number;
}

export interface SubjectScores {
  [subject: string]: BaseSubjectScore;
}
