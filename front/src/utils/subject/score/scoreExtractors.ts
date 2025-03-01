import { EXAM_TYPE_OPTIONS } from "@/shared/lib/constants/subjects";
import type { BaseSubjectScore } from "@/lib/types/score/score";
import type { SubjectName } from "@/lib/constants/subject";
import type { SubjectScoreError } from "@/components/features/charts/subject/donut/types/subjects";
import type { TestTypeName } from "@/lib/types/university/university";
import type { SubjectScore } from "@/types/subject/subjects";

export const extractScores = (
  scores: BaseSubjectScore,
  subjectName: SubjectName
): (SubjectScore | SubjectScoreError)[] => {
  const result: (SubjectScore | SubjectScoreError)[] = [];

  EXAM_TYPE_OPTIONS.forEach((type: TestTypeName) => {
    const score = scores[type as keyof BaseSubjectScore];
    if (score === undefined) {
      result.push({
        type,
        subjectName,
        code: "SCORE_NOT_FOUND",
        message: `${type}の点数が見つかりません`,
      });
    } else {
      result.push({
        type,
        value: score,
        subjectName,
      });
    }
  });

  if (result.length === 0) {
    return [
      {
        type: "共通" as TestTypeName,
        code: "NO_VALID_SCORES",
        message: `科目「${subjectName}」の有効なスコアがありません`,
        subjectName,
      },
    ];
  }

  return result;
};
