// 科目の種類
export const SUBJECT_TYPES = {
  COMMON: "共通",
  SECONDARY: "二次",
} as const;

// 科目の基本情報
export const SUBJECTS = {
  ENGLISH: "英語",
  MATH: "数学",
  JAPANESE: "国語",
  SCIENCE: "理科",
  HISTORY_GEOGRAPHY: "地歴公",
} as const;

// 科目の表示順序
export const SUBJECT_ORDER = [
  SUBJECTS.ENGLISH,
  SUBJECTS.MATH,
  SUBJECTS.JAPANESE,
  SUBJECTS.SCIENCE,
  SUBJECTS.HISTORY_GEOGRAPHY,
] as const;

// 科目ごとの色設定
export const COLORS: Record<SubjectName, string> = {
  英語: "#DAA520",
  数学: "#0047AB",
  国語: "#228B22",
  理科: "#D35400",
  地歴公: "#C71585",
} as const;

// 型定義
export type SubjectType = (typeof SUBJECT_TYPES)[keyof typeof SUBJECT_TYPES];
export type SubjectName = (typeof SUBJECTS)[keyof typeof SUBJECTS];

export interface SubjectScores {
  commonTest: number;
  secondTest: number;
}
