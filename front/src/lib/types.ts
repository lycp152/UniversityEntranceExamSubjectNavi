export interface Subject {
  universityId: number;
  departmentId: number;
  majorId: number;
  scheduleId: number;
  academicYear: number;
  subjectId: number;
  universityName: string;
  department: string;
  major: string;
  schedule: string;
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
