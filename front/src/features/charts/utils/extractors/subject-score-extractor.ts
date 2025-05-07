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
import type { SubjectScore } from '@/features/charts/types/subject-scores';
import type { SubjectName } from '@/constants/constraint/subjects/subjects';

/** 科目スコアのエラー型 */
export interface SubjectScoreError {
  /** エラータイプ */
  type: 'error';
  /** エラーメッセージ */
  message: string;
  /** 科目名 */
  subjectName: SubjectName;
}

/** スコアの基本情報 */
interface ScoreBase {
  /** 科目名 */
  name: SubjectName;
  /** テストタイプ */
  type: keyof typeof EXAM_TYPES;
  /** スコア値 */
  value: number;
}

/**
 * スコアオブジェクトを生成
 * @param base - スコアの基本情報
 * @returns 生成されたスコアオブジェクト
 */
const createScoreObject = (base: ScoreBase): SubjectScore => ({
  id: 0,
  name: base.name,
  type: EXAM_TYPES[base.type].name,
  value: base.value,
  category: EXAM_TYPES[base.type].name,
  testTypeId: EXAM_TYPES[base.type].id,
  percentage: 0,
  displayOrder: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  version: 1,
  createdBy: SYSTEM_CONSTANTS.DEFAULT_USER,
  updatedBy: SYSTEM_CONSTANTS.DEFAULT_USER,
});

/**
 * エラーオブジェクトを生成
 * @param subjectName - 科目名
 * @param message - エラーメッセージ
 * @returns 生成されたエラーオブジェクト
 */
const createErrorObject = (subjectName: SubjectName, message: string): SubjectScoreError => ({
  type: 'error',
  message,
  subjectName,
});

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
  scores: { commonTest: number; secondTest: number } | undefined,
  subjectName: string
): (SubjectScore | SubjectScoreError)[] => {
  const normalizedSubjectName = subjectName as SubjectName;

  if (!scores) {
    return [
      createErrorObject(
        normalizedSubjectName,
        `科目「${normalizedSubjectName}」のスコアが見つかりません`
      ),
    ];
  }

  const extractedScores = [
    createScoreObject({
      name: normalizedSubjectName,
      type: 'COMMON',
      value: scores.commonTest,
    }),
    createScoreObject({
      name: normalizedSubjectName,
      type: 'SECONDARY',
      value: scores.secondTest,
    }),
  ].filter(score => score.value > 0);

  if (extractedScores.length === 0) {
    return [
      createErrorObject(
        normalizedSubjectName,
        `科目「${normalizedSubjectName}」の有効なスコアがありません`
      ),
    ];
  }

  return extractedScores;
};
