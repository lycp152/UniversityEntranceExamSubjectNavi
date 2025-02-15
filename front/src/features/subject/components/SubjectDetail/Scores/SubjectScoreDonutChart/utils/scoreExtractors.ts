import { EXAM_TYPE_OPTIONS } from '@/lib/constants/subjects';
import type { SubjectScore } from '../types/subjects';
import type { BaseSubjectScore, SubjectName, SubjectScoreError } from '@/lib/types';

export const extractScores = (
  scores: BaseSubjectScore,
  subjectName: SubjectName
): (SubjectScore | SubjectScoreError)[] => {
  if (!scores) {
    return [
      {
        type: 'error',
        message: `科目「${subjectName}」のスコアが見つかりません`,
        subjectName,
      },
    ];
  }

  const extractedScores = EXAM_TYPE_OPTIONS.map((type) => ({
    type,
    value: type === '共通' ? scores.commonTest : scores.secondTest,
    subjectName,
  })).filter((score) => score.value > 0);

  if (extractedScores.length === 0) {
    return [
      {
        type: 'error',
        message: `科目「${subjectName}」の有効なスコアがありません`,
        subjectName,
      },
    ];
  }

  return extractedScores;
};
