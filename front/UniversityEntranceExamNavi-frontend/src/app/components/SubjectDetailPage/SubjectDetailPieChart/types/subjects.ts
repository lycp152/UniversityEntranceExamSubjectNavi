import type { TestType, SubjectName } from '@/features/data/types';

export interface SubjectScore {
  type: TestType;
  value: number;
  subjectName: SubjectName;
}
