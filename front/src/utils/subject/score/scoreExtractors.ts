import { EXAM_TYPE_OPTIONS } from "@/lib/constants/subjects";
import type { BaseSubjectScore } from "@/lib/types/score/score";
import type { SubjectName } from "@/constants/subject";
import type { SubjectScoreError } from "@/components/features/charts/subject/donut/types/subjects";
import type { TestTypeName } from "@/lib/types/university/university";
import type { SubjectScore } from "@/types/subject/subjects";

export const extractScores = (
  scores: BaseSubjectScore,
  subjectName: SubjectName
): (SubjectScore | SubjectScoreError)[] => {
  const result: (SubjectScore | SubjectScoreError)[] = [];

  EXAM_TYPE_OPTIONS.forEach((type) => {
    const score = scores[type as keyof BaseSubjectScore];
    if (score === undefined) {
      result.push({
        type: type as TestTypeName,
        subjectName,
        code: "SCORE_NOT_FOUND",
        message: `${type}の点数が見つかりません`,
      });
    } else {
      result.push({
        type: type as TestTypeName,
        value: score,
        subjectName,
      });
    }
  });

  if (result.length === 0) {
    return [
      {
        type: "error",
        message: `科目「${subjectName}」の有効なスコアがありません`,
        subjectName,
      },
    ];
  }

  return result;
};
