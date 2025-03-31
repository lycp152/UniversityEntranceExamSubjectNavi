/**
 * スコアバリデーション
 * 科目スコアの有効性を検証
 *
 * @module score-validator
 * @description
 * - スコア値の検証
 * - 共通テストと二次試験のスコア管理
 * - バリデーションエラーの生成
 */

import type { BaseSubjectScore, SubjectScores } from '@/types/score';
import { ValidationErrorCode, ValidationSeverity } from '@/lib/validation/constants';
import type { ValidationResult } from '@/lib/validation/types';
import { BaseValidator } from './base-validator';

/**
 * スコアの有効性を確認
 * @param score - 科目スコア
 * @returns スコアが有効かどうか
 */
export const isValidScore = (score: BaseSubjectScore): boolean => {
  return score.commonTest > 0 || score.secondTest > 0;
};

/**
 * 全てのスコアが有効かどうかを確認
 * @param subjects - 科目スコアの集合
 * @returns 少なくとも1つの有効なスコアが存在するかどうか
 */
const hasValidScores = (subjects: SubjectScores): boolean => {
  return Object.values(subjects).some(isValidScore);
};

/**
 * スコアバリデーションクラス
 * 科目スコアの検証を実行
 */
export class ScoreValidator extends BaseValidator<SubjectScores> {
  /**
   * スコアデータのバリデーションを実行
   * @param data - バリデーション対象のスコアデータ
   * @returns バリデーション結果
   */
  async validate(data: unknown): Promise<ValidationResult<SubjectScores>> {
    const subjects = data as SubjectScores;
    const isValid = hasValidScores(subjects);

    return {
      isValid,
      data: isValid ? subjects : undefined,
      errors: isValid
        ? []
        : [
            {
              code: ValidationErrorCode.INVALID_DATA_FORMAT,
              message: 'スコアが無効です',
              field: 'スコア',
              severity: ValidationSeverity.ERROR,
            },
          ],
      metadata: {
        validatedAt: Date.now(),
        rules: ['score-validation'],
      },
    };
  }
}
