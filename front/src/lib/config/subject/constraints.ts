/**
 * 科目の制約定数
 */
export const SUBJECT_CONSTRAINTS = {
  /** 最小スコア */
  MIN_SCORE: 0,
  /** 最大スコア */
  MAX_SCORE: 1000,
  /** 最小重み */
  MIN_WEIGHT: 0,
  /** 最大重み */
  MAX_WEIGHT: 1,
} as const;

/**
 * 科目の表示順序
 */
export const SUBJECT_DISPLAY_ORDER = ['英語L', '英語R', '数学', '国語', '理科', '地歴公'] as const;
