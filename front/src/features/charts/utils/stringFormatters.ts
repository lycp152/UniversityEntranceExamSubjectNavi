import { TestType } from "@/types/score";
import { FORMAT_PATTERNS } from "@/constants/subject-formats";

export const formatWithTestType = (
  name: string,
  testType: TestType
): string => {
  return FORMAT_PATTERNS.TEST_TYPE(name, testType);
};
