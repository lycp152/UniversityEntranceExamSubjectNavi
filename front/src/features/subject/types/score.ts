import {
  ScoreMetrics,
  BaseSubjectScore as LibBaseSubjectScore,
  SubjectScores as LibSubjectScores,
  TEST_TYPES,
} from '@/lib/types/score';

/**
 * 科目カテゴリーの定義
 */
export const SUBJECT_CATEGORIES = {
  ENGLISH: '英語',
  MATH: '数学',
  SCIENCE: '理科',
  SOCIAL: '社会',
} as const;

export type SubjectCategory = (typeof SUBJECT_CATEGORIES)[keyof typeof SUBJECT_CATEGORIES];

/**
 * 科目固有のスコア情報
 */
export interface SubjectSpecificScore extends LibBaseSubjectScore {
  category: SubjectCategory;
}

/**
 * カテゴリー別の集計結果
 */
export interface CategoryScore {
  category: SubjectCategory;
  [TEST_TYPES.COMMON]: ScoreMetrics;
  [TEST_TYPES.INDIVIDUAL]: ScoreMetrics;
  total: ScoreMetrics;
}

export type { LibBaseSubjectScore as BaseSubjectScore, LibSubjectScores as SubjectScores };
