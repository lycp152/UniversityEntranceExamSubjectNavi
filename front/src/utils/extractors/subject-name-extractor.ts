/**
 * 科目名からカテゴリ（教科）を抽出する
 */
export const getCategoryFromSubject = (subjectName: string): string => {
  // 地歴公などの特殊な科目名はそのままカテゴリとして扱う
  if (!/[RL]$/.test(subjectName)) {
    return subjectName;
  }
  // 英語RやLなどの場合はサフィックスを削除
  return subjectName.replace(/[RL]$/, '');
};

/**
 * 科目名から表示用の名前を生成する
 */
export const getDisplayName = (subjectName: string): string => {
  return subjectName.replace(/^[^RLa-z]+/, '');
};
