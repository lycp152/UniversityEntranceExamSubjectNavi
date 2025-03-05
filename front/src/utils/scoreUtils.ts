import type { BaseSubjectScore } from "@/types/subject/score";
import type { SubjectName } from "@/lib/constants/subject";
import type { SubjectScore } from "@/types/subject/subjects";
import { EXAM_TYPE_OPTIONS } from "@/lib/constants/subjects";

/**
 * 科目のスコアを抽出する
 */
export const extractScores = (
  scores: BaseSubjectScore,
  subjectName: SubjectName
): (
  | SubjectScore
  | { type: "error"; message: string; subjectName: SubjectName }
)[] => {
  if (!scores) {
    return [
      {
        type: "error",
        message: `科目「${subjectName}」のスコアが見つかりません`,
        subjectName,
      },
    ];
  }

  const extractedScores = EXAM_TYPE_OPTIONS.map((examType) => ({
    type: examType,
    value: examType === "共通" ? scores.commonTest : scores.secondTest,
    subjectName,
  })).filter((score) => score.value > 0);

  if (extractedScores.length === 0) {
    return [
      {
        type: "error",
        message: `科目「${subjectName}」の有効なスコアがありません`,
        subjectName,
      },
    ];
  }

  return extractedScores;
};
