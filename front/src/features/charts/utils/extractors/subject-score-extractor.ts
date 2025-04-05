/**
 * 科目スコアの抽出処理
 * 科目スコアの抽出と検証に関する処理を提供
 *
 * @module subject-score-extractor
 * @description
 * - 科目スコアの抽出処理
 * - スコアの検証処理
 * - エラー情報の生成
 */

import { EXAM_TYPES } from '@/constants/constraint/exam-types';
import { SYSTEM_CONSTANTS } from '@/features/charts/constants/system';
import type { SubjectScore } from '@/types/subject-scores';
import type { SubjectName } from '@/constants/constraint/subjects';

/** 科目スコアのエラー型 */
export interface SubjectScoreError {
  /** エラータイプ */
  type: 'error';
  /** エラーメッセージ */
  message: string;
  /** 科目名 */
  subjectName: SubjectName;
}

/**
 * 科目スコアを抽出
 * @param scores - 共通テストと二次テストのスコア
 * @param subjectName - 科目名
 * @returns 抽出された科目スコアまたはエラー情報
 * @example
 * - スコアが存在する場合: [{ id: 0, name: "英語", type: "共通", value: 80, ... }]
 * - スコアが存在しない場合: [{ type: "error", message: "科目「英語」のスコアが見つかりません", ... }]
 */
export const extractScores = (
  scores: { commonTest: number; secondTest: number },
  subjectName: string
): (SubjectScore | SubjectScoreError)[] => {
  const normalizedSubjectName = subjectName as SubjectName;

  if (!scores) {
    return [
      {
        type: 'error',
        message: `科目「${normalizedSubjectName}」のスコアが見つかりません`,
        subjectName: normalizedSubjectName,
      },
    ];
  }

  const extractedScores = Object.values(EXAM_TYPES)
    .map(type => ({
      id: 0,
      name: normalizedSubjectName,
      type: type.name,
      value: type.name === '共通' ? scores.commonTest : scores.secondTest,
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
    .filter(score => score.value > 0);

  if (extractedScores.length === 0) {
    return [
      {
        type: 'error',
        message: `科目「${normalizedSubjectName}」の有効なスコアがありません`,
        subjectName: normalizedSubjectName,
      },
    ];
  }

  return extractedScores;
};
