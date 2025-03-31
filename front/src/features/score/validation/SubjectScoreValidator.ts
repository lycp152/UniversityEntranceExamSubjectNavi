import { SubjectScoreError, SubjectScore } from "@/types/score";

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
