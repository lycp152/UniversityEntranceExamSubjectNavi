import { TestType } from "../types/subjects";
import { TransformedSubjectData } from "../types/pieDataTransformerTypes";
import { getCategoryFromSubject, getDisplayName } from "./subjectNameParser";
import { formatWithTestType } from "./subjectNameFormatter";

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
