export interface SubjectScore {
  commonTest: number;
  secondTest: number;
}

export interface Subject {
  universityId: number;
  departmentId: number;
  subjectId: number;
  universityName: string;
  department: string;
  major: string;
  schedule: string;
  enrollment: number;
  rank: number;
  subjectRatio: number;
  subjects: {
    英語R: SubjectScore;
    英語L: SubjectScore;
    数学: SubjectScore;
    国語: SubjectScore;
    理科: SubjectScore;
    地歴公: SubjectScore;
  };
}
