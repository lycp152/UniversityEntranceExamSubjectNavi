import type { TestType, SubjectName } from '@/lib/types';

export interface SubjectScore {
  type: TestType;
  value: number;
  subjectName: SubjectName;
}
