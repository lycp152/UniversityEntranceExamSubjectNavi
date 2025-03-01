import type { SubjectScore, SubjectScoreError } from "@/types/subject/common";
import { SUBJECT_TYPES } from "@/lib/constants/subject";

export const validateSubjectScore = (
  score: SubjectScore
): SubjectScoreError | null => {
  if (score.value < 0 || score.value > 100) {
    return {
      type: score.type,
      code: "INVALID_SCORE_RANGE",
      message: "点数は0から100の間で入力してください",
      subjectName: score.subjectName,
    };
  }
  return null;
};

export const validateTestType = (type: string): boolean => {
  return type === SUBJECT_TYPES.COMMON || type === SUBJECT_TYPES.SECONDARY;
};
