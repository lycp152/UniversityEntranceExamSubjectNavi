import type { Subject, SubjectGroup } from "../../../types/subjects/subject";

/**
 * 変換元のデータ型
 */
export interface TransformSource {
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
    [key: string]: {
      commonTest: number;
      secondTest: number;
    };
  };
}

/**
 * 変換結果の型
 */
export interface TransformResult {
  subject: Subject;
  groups: SubjectGroup[];
  metadata: {
    transformedAt: number;
    source: TransformSource;
  };
}
