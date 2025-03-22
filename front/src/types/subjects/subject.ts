import type {
  TEST_TYPES,
  SUBJECT_TYPES,
} from "../../features/subjects/config/types";
import { BaseModel } from "@/types/models/base-model";
import type { DetailedSubjectScore } from "@/types/score/score2";

export type TestType = (typeof TEST_TYPES)[keyof typeof TEST_TYPES];
export type SubjectType = (typeof SUBJECT_TYPES)[keyof typeof SUBJECT_TYPES];

/**
 * 科目の基本型定義
 */
export interface Subject extends BaseModel {
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

/**
 * 科目グループの型定義
 */
export interface SubjectGroup {
  testType: TestType;
  subjects: Subject[];
  totalScore: number;
  maxTotalScore: number;
  isValid: boolean;
}

// SubjectScoreをDetailedSubjectScoreとして再エクスポート
export type { DetailedSubjectScore as SubjectScore };
