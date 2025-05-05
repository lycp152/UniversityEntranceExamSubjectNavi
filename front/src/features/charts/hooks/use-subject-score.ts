/**
 * 科目のスコア計算を管理するフック
 * 全体の合計点とカテゴリごとの合計点を計算し、再利用可能な形で提供
 */
import type { UISubject } from '@/types/university-subject';
import {
  calculateTotalScore,
  calculateCategoryTotal,
  calculateTotalScores,
} from '@/utils/subject-scores';

/**
 * 科目スコアの計算を管理するフック
 * @param subjectData - 科目データ
 * @returns 合計点とカテゴリ別合計点を計算する関数
 */
export const useCalculateScore = (subjectData: UISubject) => {
  /** 全体の合計点を事前計算 */
  const totalScore = calculateTotalScore(subjectData.subjects);

  /** 共通テスト、二次試験、総合の合計点を計算 */
  const { commonTest, secondTest, total } = calculateTotalScores(subjectData.subjects);

  return {
    totalScore,
    calculateCategoryTotal,
    commonTest,
    secondTest,
    total,
  };
};
