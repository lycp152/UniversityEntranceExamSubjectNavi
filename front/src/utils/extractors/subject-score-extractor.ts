import { EXAM_TYPES } from "@/constants/subjects";
import type { SubjectScore } from "@/types/charts/subject-scores";
import type { SubjectName } from "@/types/subjects";

export interface SubjectScoreError {
  type: "error";
  message: string;
  subjectName: SubjectName;
}

export const extractScores = (
  scores: { commonTest: number; secondTest: number },
  subjectName: string
): (SubjectScore | SubjectScoreError)[] => {
  // 英語の場合はL/Rの接尾辞を保持
  const normalizedSubjectName = subjectName as SubjectName;

  if (!scores) {
    return [
      {
        type: "error",
        message: `科目「${normalizedSubjectName}」のスコアが見つかりません`,
        subjectName: normalizedSubjectName,
      },
    ];
  }

  const extractedScores = Object.values(EXAM_TYPES)
    .map((type) => ({
      type,
      value: type === "共通" ? scores.commonTest : scores.secondTest,
      subjectName: normalizedSubjectName,
    }))
    .filter((score) => score.value > 0);

  if (extractedScores.length === 0) {
    return [
      {
        type: "error",
        message: `科目「${normalizedSubjectName}」の有効なスコアがありません`,
        subjectName: normalizedSubjectName,
      },
    ];
  }

  return extractedScores;
};
