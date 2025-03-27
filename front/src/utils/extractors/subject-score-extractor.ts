import { EXAM_TYPES, SYSTEM_CONSTANTS } from "@/constants/subjects";
import type { SubjectScore } from "@/types/charts/subject-scores";
import type { SubjectName } from "@/constants/subjects";

export interface SubjectScoreError {
  type: "error";
  message: string;
  subjectName: SubjectName;
}

export const extractScores = (
  scores: { commonTest: number; secondTest: number },
  subjectName: string
): (SubjectScore | SubjectScoreError)[] => {
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
      id: 0,
      name: normalizedSubjectName,
      type: type.name,
      value: type.name === "共通" ? scores.commonTest : scores.secondTest,
      category: type.name,
      testTypeId: type.id,
      percentage: 0,
      displayOrder: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
      createdBy: SYSTEM_CONSTANTS.DEFAULT_USER,
      updatedBy: SYSTEM_CONSTANTS.DEFAULT_USER,
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
