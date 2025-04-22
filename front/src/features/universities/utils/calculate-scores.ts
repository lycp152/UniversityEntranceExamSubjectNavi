import { UISubject } from '@/types/university-subject';

/**
 * 科目の合計点を計算する関数
 * 共通テスト、二次試験、総合の合計点を計算
 *
 * @param {UISubject['subjects']} subjects - 科目ごとの配点情報
 * @returns {Object} 合計点情報
 * @returns {number} commonTest - 共通テストの合計点
 * @returns {number} secondTest - 二次試験の合計点
 * @returns {number} total - 総合の合計点
 */
export const calculateTotalScores = (subjects: UISubject['subjects']) => {
  // 共通テストの合計点を計算
  const commonTestTotal = Object.values(subjects).reduce(
    (sum, subject) => sum + subject.commonTest,
    0
  );

  // 二次試験の合計点を計算
  const secondTestTotal = Object.values(subjects).reduce(
    (sum, subject) => sum + subject.secondTest,
    0
  );

  // 総合の合計点を計算
  const total = commonTestTotal + secondTestTotal;

  return { commonTest: commonTestTotal, secondTest: secondTestTotal, total };
};
