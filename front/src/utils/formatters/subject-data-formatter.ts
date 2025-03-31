import { TestType } from '@/types/score';
import { TransformedSubjectData } from '@/types/charts/transformers';
import {
  extractSubjectMainCategory,
  removeSubjectNamePrefix,
  formatWithTestType,
} from '@/utils/formatters/subject-name-display-formatter';

export const transformSubjectData = (
  subjectName: string,
  testType: TestType
): TransformedSubjectData => {
  const category = extractSubjectMainCategory(subjectName);
  const baseDisplayName = removeSubjectNamePrefix(subjectName);

  return {
    name: formatWithTestType(subjectName, testType),
    displayName: formatWithTestType(baseDisplayName, testType),
    category,
    testTypeId: 0,
    percentage: 0,
    displayOrder: 0,
  };
};
