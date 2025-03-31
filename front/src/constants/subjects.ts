import type { SubjectCategoryWithColor } from '@/types/subject-categories';

/**
 * システム関連の定数
 * アプリケーション全体で使用されるシステム設定を定義
 */
export const SYSTEM_CONSTANTS = {
  /** システムユーザーのデフォルト値 */
  DEFAULT_USER: 'system',
} as const;

/**
 * 試験区分の定義
 * バックエンドの定義と同期を保つ必要があります
 * @see back/internal/domain/models/models.go
 */
export const EXAM_TYPES = {
  /** 共通試験の定義 */
  COMMON: {
    name: '共通',
    id: 1,
  },
  /** 二次試験の定義 */
  SECONDARY: {
    name: '二次',
    id: 2,
  },
} as const;

/** 試験区分の型定義 */
export type ExamType = (typeof EXAM_TYPES)[keyof typeof EXAM_TYPES]['name'];
/** 試験区分IDの型定義 */
export type ExamTypeId = (typeof EXAM_TYPES)[keyof typeof EXAM_TYPES]['id'];

/**
 * 試験区分の制約
 * バックエンドの制約値と同期を保つ必要があります
 * @see back/internal/domain/models/models.go
 */
export const EXAM_TYPE_CONSTRAINTS = {
  /** 試験区分名の最大長 */
  MAX_NAME_LENGTH: 10,
  /** 有効な試験区分名の一覧 */
  VALID_NAMES: ['共通', '二次'] as const,
} as const;

/** 試験区分名の型定義 */
export type ExamTypeName = (typeof EXAM_TYPE_CONSTRAINTS.VALID_NAMES)[number];

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

/**
 * 科目の定義
 * バックエンドの定義と同期を保つ必要があります
 * @see back/internal/domain/models/models.go
 */
export const SUBJECTS = {
  /** 英語リーディング */
  ENGLISH_R: '英語R',
  /** 英語リスニング */
  ENGLISH_L: '英語L',
  /** 数学 */
  MATH: '数学',
  /** 国語 */
  JAPANESE: '国語',
  /** 理科 */
  SCIENCE: '理科',
  /** 地歴公 */
  SOCIAL: '地歴公',
} as const;

/** 科目名の型定義 */
export type SubjectName = (typeof SUBJECTS)[keyof typeof SUBJECTS];

/**
 * フォーマットパターンの定義
 * 表示用の文字列フォーマットを定義
 */
export const FORMAT_PATTERNS = {
  /** テストタイプに基づくフォーマット */
  TEST_TYPE: (name: string, testType: string) => {
    return testType === 'common' ? `${name}(共通)` : `${name}(二次)`;
  },
} as const;
