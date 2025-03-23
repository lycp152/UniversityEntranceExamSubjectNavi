/**
 * 科目の表示順序を定義
 * この順序でUIに科目が表示される
 */
export const SUBJECT_DISPLAY_ORDER = [
  "英語L",
  "英語R",
  "数学",
  "国語",
  "理科",
  "地歴公",
] as const;

/**
 * 科目名から表示用の名前へのマッピング
 * 各科目名に対する人間が読みやすい表示名を定義
 */
export const SUBJECT_NAME_DISPLAY_MAPPING = {
  英語R: "英語（リーディング）",
  英語L: "英語（リスニング）",
  "英語R + L": "英語（総合）",
  数学: "数学",
  国語: "国語",
  理科: "理科",
  地歴公: "地理歴史・公民",
} as const;

/**
 * 科目カテゴリーごとの表示色を定義
 * グラフやUI要素の色分けに使用
 */
export const SUBJECT_CATEGORY_COLORS = {
  英語: "#DAA520",
  数学: "#0047AB",
  国語: "#228B22",
  理科: "#D35400",
  地歴公: "#C71585",
} as const;

/**
 * 入学試験区分の選択肢を定義
 * 共通テストと二次試験の区分
 */
export const EXAM_TYPE_OPTIONS = ["共通", "二次"] as const;

/**
 * 科目関連の表示フォーマットパターンを定義
 * 科目名、スコア、パーセンテージなどの表示形式
 */
export const SUBJECT_FORMAT_PATTERNS = {
  EXAM_TYPE_WITH_NAME: (name: string, type: string) => `${name}(${type})`,
  SCORE_PERCENTAGE: (value: number) => `${value.toFixed(2)}%`,
  SCORE_VALUE: (value: number) => value.toString(),
} as const;

/**
 * メインの教科カテゴリー一覧を定義
 * 英語、数学などの基本的な教科区分
 */
export const SUBJECT_MAIN_CATEGORIES = [
  "英語",
  "数学",
  "国語",
  "理科",
  "地歴公",
] as const;

/**
 * 試験区分の定義
 */
export const SUBJECT_TYPES = {
  COMMON: "共通",
  SECONDARY: "二次",
} as const;

// 科目の基本カテゴリー
export const SUBJECT_BASE_CATEGORIES = {
  ENGLISH: "英語",
  MATH: "数学",
  JAPANESE: "国語",
  SCIENCE: "理科",
  SOCIAL: "地歴公",
} as const;

/**
 * 科目の定義
 */
export const SUBJECTS = {
  ENGLISH_R: "英語R",
  ENGLISH_L: "英語L",
  MATH: "数学",
  JAPANESE: "国語",
  SCIENCE: "理科",
  SOCIAL: "地歴公",
} as const;

/**
 * 科目名から表示用の名前へのマッピング
 */
export const SUBJECT_DISPLAY_NAMES = {
  [SUBJECTS.ENGLISH_R]: "英語（リーディング）",
  [SUBJECTS.ENGLISH_L]: "英語（リスニング）",
  "英語R + L": "英語（総合）",
  [SUBJECTS.MATH]: "数学",
  [SUBJECTS.JAPANESE]: "国語",
  [SUBJECTS.SCIENCE]: "理科",
  [SUBJECTS.SOCIAL]: "地理歴史・公民",
} as const;

/**
 * 科目の表示順序
 */
export const SUBJECT_ORDER = [
  "英語",
  "数学",
  "国語",
  "理科",
  "地歴公",
] as const;

/**
 * 科目関連の表示フォーマット
 */
export const SUBJECT_FORMAT = {
  EXAM_TYPE_WITH_NAME: (name: string, type: string) => `${name}(${type})`,
  SCORE_PERCENTAGE: (value: number) => `${value.toFixed(2)}%`,
  SCORE_VALUE: (value: number) => value.toString(),
} as const;

/**
 * 有効な科目名のパターン
 */
export const VALID_SUBJECT_NAME_PATTERN = "^(英語[RL]|数学|国語|理科|地歴公)$";

/**
 * 型定義
 */
export type SubjectName =
  (typeof SUBJECT_BASE_CATEGORIES)[keyof typeof SUBJECT_BASE_CATEGORIES];
export type SubjectCategory = keyof typeof SUBJECT_CATEGORY_COLORS;

export interface SubjectScores {
  commonTest: number;
  secondTest: number;
}
