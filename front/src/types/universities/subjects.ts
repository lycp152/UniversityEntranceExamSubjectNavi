import type { BaseSubjectScore } from "@/types/score";

// UIの型定義
export interface UISubject {
  id: number;
  name: string;
  score: number;
  percentage: number;
  displayOrder: number;
  testTypeId: number;
  university: {
    id: number;
    name: string;
  };
  department: {
    id: number;
    name: string;
  };
  major: {
    id: number;
    name: string;
  };
  examInfo: {
    id: number;
    enrollment: number;
    academicYear: number;
    status: string;
  };
  admissionSchedule: {
    id: number;
    name: string;
    displayOrder: number;
  };
  subjects: Record<string, BaseSubjectScore>;
}
