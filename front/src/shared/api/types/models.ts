export interface University {
  id: number;
  name: string;
  code: string;
}

export interface Subject {
  id: number;
  name: string;
  code: string;
}

export interface Score {
  id: number;
  value: number;
  subjectId: number;
  universityId: number;
}
