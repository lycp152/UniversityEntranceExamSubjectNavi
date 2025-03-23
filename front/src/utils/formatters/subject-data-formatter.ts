import { TestType } from "@/types/score";
import { TransformedSubjectData } from "@/types/charts/transformers";
import {
  getCategoryFromSubject,
  getDisplayName,
} from "@/utils/extractors/subject-name-extractor";
import { formatWithTestType } from "@/utils/formatters/subject-name-display-formatter";

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
