import type { BaseSubjectScore, SubjectName, TestType } from '@/features/data/types';
import type { SubjectScore, SubjectScoreError } from '../types/subjects';
import { EXAM_TYPE_OPTIONS } from '@/features/data/constants/subjects';

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

  const extractedScores = EXAM_TYPE_OPTIONS.map((type: TestType) => ({
    type,
    value: type === '共通' ? scores.commonTest : scores.secondTest,
    subjectName,
  })).filter((score: SubjectScore) => score.value > 0);

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
