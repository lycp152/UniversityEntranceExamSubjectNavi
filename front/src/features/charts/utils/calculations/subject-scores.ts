/**
 * 科目スコアの計算処理
 * 科目スコアの合計やカテゴリ別の合計を計算
 *
 * @module subject-scores
 * @description
 * - 全科目の合計スコア計算
 * - カテゴリ別の合計スコア計算
 */

import { SubjectScores } from '@/types/score';
import { getCategoryFromSubject } from '@/features/charts/utils/extractors/subject-name-extractor';

/**
 * 全科目の合計スコアを計算
 * @param subjects - 科目スコアのマップ
 * @returns 全科目の合計スコア
 */
export const calculateTotalScore = (subjects: SubjectScores): number =>
  Object.values(subjects).reduce((sum, scores) => sum + scores.commonTest + scores.secondTest, 0);

/**
 * 指定されたカテゴリの合計スコアを計算
 * @param subjects - 科目スコアのマップ
 * @param targetCategory - 対象のカテゴリ
 * @returns カテゴリ別の合計スコア
 */
export const calculateCategoryTotal = (subjects: SubjectScores, targetCategory: string): number =>
  Object.entries(subjects)
    .filter(([key]) => getCategoryFromSubject(key) === targetCategory)
    .reduce((sum, [, scores]) => sum + scores.commonTest + scores.secondTest, 0);
