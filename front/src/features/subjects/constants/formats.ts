import { TestType } from "@/types/score/score";

export const FORMAT_PATTERNS = {
  SUBJECT_WITH_TEST_TYPE: (subject: string, testType: TestType) =>
    `${subject}(${testType})`,
  TEST_TYPE_WITH_SUBJECT: (subject: string, testType: TestType) =>
    `${testType}(${subject})`,
} as const;
