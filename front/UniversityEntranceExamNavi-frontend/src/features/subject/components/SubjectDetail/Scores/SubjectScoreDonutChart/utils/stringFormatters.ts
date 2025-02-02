import { TestType } from "../types/subjects";
import { FORMAT_PATTERNS } from "../constants/formats";

export const formatWithTestType = (
  name: string,
  testType: TestType
): string => {
  return FORMAT_PATTERNS.TEST_TYPE(name, testType);
};
