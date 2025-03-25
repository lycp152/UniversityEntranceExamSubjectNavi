// 科目のスコア計算を管理するフック
// 全体の合計点とカテゴリごとの合計点を計算し、再利用可能な形で提供
import type { UISubject } from "@/types/universities/subjects";
import type { SubjectCategory } from "@/constants/subjects";

export const useCalculateScore = (subjectData: UISubject) => {
  // 生データから全体の合計点を計算する関数
  // 共通テストと二次試験のスコアを合算して、全科目の合計点を算出
  // 入力: UISubject形式の科目データ
  // 出力: 全科目の合計点（共通テスト + 二次試験）
  const calculateTotalScore = (subjects: UISubject["subjects"]) =>
    Object.values(subjects).reduce(
      (sum, scores) => sum + scores.commonTest + scores.secondTest,
      0
    );

  // カテゴリ（科目）ごとの合計点を計算する関数
  // 指定されたカテゴリに属する科目の共通テストと二次試験のスコアを合算
  // 入力: UISubject形式の科目データとカテゴリ
  // 出力: 指定カテゴリの合計点（共通テスト + 二次試験）
  const calculateCategoryTotal = (
    subjects: UISubject["subjects"],
    category: SubjectCategory
  ) =>
    Object.entries(subjects)
      .filter(([key]) => key.startsWith(category))
      .reduce(
        (sum, [, scores]) => sum + scores.commonTest + scores.secondTest,
        0
      );

  // 全体の合計点を事前計算
  const totalScore = calculateTotalScore(subjectData.subjects);

  return {
    totalScore,
    calculateCategoryTotal,
  };
};
