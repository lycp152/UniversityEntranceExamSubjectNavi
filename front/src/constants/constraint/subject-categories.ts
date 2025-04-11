import type { SubjectCategoryWithColor } from '@/types/subject-categories';

/**
 * 教科の基本カテゴリとその表示色を定義
 * グラフやUI要素の色分けに使用
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
