import type { BaseSubjectScore, SubjectName, SubjectScore, SubjectScoreError } from '../types';
import { EXAM_TYPE_OPTIONS } from '../constants/subjects';
import { TEST_TYPES } from '../types';

/**
 * 科目のスコアを試験区分ごとに抽出する
 */
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

  const extractedScores = EXAM_TYPE_OPTIONS.map((examType) => ({
    type: examType === '共通' ? TEST_TYPES.COMMON : TEST_TYPES.SECOND,
    value: examType === '共通' ? scores.commonTest : scores.secondTest,
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
