import { TestType } from '@/lib/types';
import { FORMAT_PATTERNS } from '../constants/subjectFormats';

export const formatWithTestType = (name: string, testType: TestType): string => {
  return FORMAT_PATTERNS.TEST_TYPE(name, testType);
};
