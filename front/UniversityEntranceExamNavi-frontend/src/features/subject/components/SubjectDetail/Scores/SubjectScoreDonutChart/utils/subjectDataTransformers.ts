import type { TestType } from '@/features/data/types';
import { TransformedSubjectData } from '../types/transformers';
import { getCategoryFromSubject, getDisplayName } from './stringTransformers';
import { formatWithTestType } from './stringFormatters';

export const transformSubjectData = (
  subjectName: string,
  testType: TestType
): TransformedSubjectData => {
  const category = getCategoryFromSubject(subjectName);
  const baseDisplayName = getDisplayName(subjectName);

  return {
    name: formatWithTestType(subjectName, testType),
    displayName: formatWithTestType(baseDisplayName, testType),
    category,
  };
};
