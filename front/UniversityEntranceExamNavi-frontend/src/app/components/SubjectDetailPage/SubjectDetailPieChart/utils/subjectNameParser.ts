/**
 * 科目名からカテゴリー（教科）を抽出する
 */
export const getCategoryFromSubject = (subjectName: string): string => {
  return subjectName.replace(/[RL]$/, '');
};

/**
 * 科目名から表示用の名前を生成する
 */
export const getDisplayName = (subjectName: string): string => {
  return subjectName.replace(/^[^RLa-z]+/, '');
};
