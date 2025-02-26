import { SUBJECT_TYPES, SubjectName } from "@/lib/constants/subject";

export const formatSubjectWithType = (
  subject: SubjectName,
  type: string
): string => {
  return `${subject}(${type})`;
};

export const formatScore = (score: number): string => {
  return score.toFixed(1);
};

export const formatTestType = (type: string): string => {
  switch (type) {
    case SUBJECT_TYPES.COMMON:
      return "共通テスト";
    case SUBJECT_TYPES.SECONDARY:
      return "二次試験";
    default:
      return type;
  }
};
