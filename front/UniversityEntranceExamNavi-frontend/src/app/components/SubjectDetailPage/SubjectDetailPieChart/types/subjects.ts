import type { TestType, SubjectName } from '@/features/data/types';

export interface SubjectScore {
  type: TestType;
  value: number;
  subjectName: SubjectName;
}

export interface SubjectScoreError {
  type: 'error';
  message: string;
  subjectName: SubjectName;
}

export interface ScoreEntry {
  commonTest: number;
  secondTest: number;
}
