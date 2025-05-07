/**
 * 科目名の抽出処理
 * 科目名からカテゴリや表示用の名前を抽出
 *
 * @module subject-name-extractor
 * @description
 * - 科目名からカテゴリの抽出
 * - 科目名から表示用の名前の生成
 */

/**
 * 科目名からカテゴリ（教科）を抽出
 * @param subjectName - 科目名
 * @returns カテゴリ名
 * @example
 * - "英語R" -> "英語"
 * - "地歴公" -> "地歴公"
 */
export const getCategoryFromSubject = (subjectName: string): string => {
  // その他の科目はそのままカテゴリとして扱う
  if (!/[RL]$/.test(subjectName)) {
    return subjectName;
  }
  // 英語RやLなどの場合はサフィックスを削除
  return subjectName.replace(/[RL]$/, '');
};
