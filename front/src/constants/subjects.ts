import type { SubjectCategoryWithColor } from "@/types/subjects";

/**
 * 試験区分の定義
 * バックエンドの定義と同期を保つ必要があります
 * @see back/internal/domain/models/models.go
 */
export const EXAM_TYPES = {
  COMMON: "共通",
  SECONDARY: "二次",
} as const;

/**
 * 試験区分の制約
 * バックエンドの制約値と同期を保つ必要があります
 * @see back/internal/domain/models/models.go
 */
export const EXAM_TYPE_CONSTRAINTS = {
  MAX_NAME_LENGTH: 10,
  VALID_NAMES: ["共通", "二次"] as const,
} as const;

/**
 * 教科の基本カテゴリとその表示色を定義
 * グラフやUI要素の色分けに使用
 */
export const SUBJECT_CATEGORIES: Record<string, SubjectCategoryWithColor> = {
  ENGLISH: {
    category: "英語",
    color: "#DAA520",
  },
  MATH: {
    category: "数学",
    color: "#0047AB",
  },
  JAPANESE: {
    category: "国語",
    color: "#228B22",
  },
  SCIENCE: {
    category: "理科",
    color: "#D35400",
  },
  SOCIAL: {
    category: "地歴公",
    color: "#C71585",
  },
} as const;

/**
 * 科目の定義
 * バックエンドの定義と同期を保つ必要があります
 * @see back/internal/domain/models/models.go
 */
export const SUBJECTS = {
  ENGLISH_R: "英語R",
  ENGLISH_L: "英語L",
  MATH: "数学",
  JAPANESE: "国語",
  SCIENCE: "理科",
  SOCIAL: "地歴公",
} as const;

export const FORMAT_PATTERNS = {
  // テストタイプに基づくフォーマット
  TEST_TYPE: (name: string, testType: string) => {
    return testType === "common" ? `${name}(共通)` : `${name}(二次)`;
  },
} as const;

// バックエンドの型定義と同期を取るための型
export type ExamType = (typeof EXAM_TYPES)[keyof typeof EXAM_TYPES];
export type ExamTypeName = (typeof EXAM_TYPE_CONSTRAINTS.VALID_NAMES)[number];
export type SubjectCategory = keyof typeof SUBJECT_CATEGORIES;
export type Subject = (typeof SUBJECTS)[keyof typeof SUBJECTS];
