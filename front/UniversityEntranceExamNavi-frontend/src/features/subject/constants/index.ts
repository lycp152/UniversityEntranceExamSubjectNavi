// 科目の種類
export const SUBJECT_TYPES = {
  COMMON: '共通',
  SECONDARY: '二次',
} as const;

// 科目の基本情報
export const SUBJECTS = {
  ENGLISH: '英語',
  MATH: '数学',
  JAPANESE: '国語',
  SCIENCE: '理科',
  SOCIAL: '地歴公',
} as const;

// 科目の表示順序
export const SUBJECT_ORDER = [
  SUBJECTS.ENGLISH,
  SUBJECTS.MATH,
  SUBJECTS.JAPANESE,
  SUBJECTS.SCIENCE,
  SUBJECTS.SOCIAL,
] as const;

// 科目ごとの色設定
export const COLORS = {
  [SUBJECTS.ENGLISH]: '#DAA520',
  [SUBJECTS.MATH]: '#0047AB',
  [SUBJECTS.JAPANESE]: '#228B22',
  [SUBJECTS.SCIENCE]: '#D35400',
  [SUBJECTS.SOCIAL]: '#C71585',
  [SUBJECT_TYPES.COMMON]: '#595959',
  [SUBJECT_TYPES.SECONDARY]: '#000000',
} as const;

// 型定義
export type SubjectType = (typeof SUBJECT_TYPES)[keyof typeof SUBJECT_TYPES];
export type SubjectName = (typeof SUBJECTS)[keyof typeof SUBJECTS];
