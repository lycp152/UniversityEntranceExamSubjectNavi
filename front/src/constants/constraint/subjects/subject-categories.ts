import type { SubjectCategoryWithColor } from '@/types/subject-categories';

/**
 * 教科の基本カテゴリとその表示色を定義
 * グラフやUI要素の色分けに使用
 * バックエンドの定義と同期を保つ必要があります
 * @see back/internal/domain/models/models.go
 * @see back/migrations/seeds/main.go
 */
export const SUBJECT_CATEGORIES: Record<string, SubjectCategoryWithColor> = {
  /** 英語科目のカテゴリ */
  ENGLISH: {
    category: '英語',
    color: '#DAA520',
  },
  /** 数学科目のカテゴリ */
  MATH: {
    category: '数学',
    color: '#0047AB',
  },
  /** 国語科目のカテゴリ */
  JAPANESE: {
    category: '国語',
    color: '#228B22',
  },
  /** 理科科目のカテゴリ */
  SCIENCE: {
    category: '理科',
    color: '#D35400',
  },
  /** 地歴公科目のカテゴリ */
  SOCIAL: {
    category: '地歴公',
    color: '#C71585',
  },
} as const;

/** 科目カテゴリの型定義 */
export type SubjectCategory = keyof typeof SUBJECT_CATEGORIES;

/**
 * 科目カテゴリの制約値
 * バックエンドの制約値と同期を保つ必要があります
 * @see back/internal/domain/models/models.go
 */
export const SUBJECT_CATEGORY_CONSTRAINTS = {
  /** カテゴリ名の最大長 */
  MAX_CATEGORY_NAME_LENGTH: 10,
  /** カテゴリ名の最小長 */
  MIN_CATEGORY_NAME_LENGTH: 1,
  /** カテゴリの最大数 */
  MAX_CATEGORIES: 5,
} as const;

/** 科目カテゴリ名の型定義 */
export type SubjectCategoryName =
  (typeof SUBJECT_CATEGORIES)[keyof typeof SUBJECT_CATEGORIES]['category'];
