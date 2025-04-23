/**
 * 科目の定義
 * バックエンドの定義と同期を保つ必要があります
 * @see back/internal/domain/models/models.go
 * @see back/migrations/seeds/main.go
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
 * 科目名の制約値
 * バックエンドの制約値と同期を保つ必要があります
 * @see back/internal/domain/models/models.go
 */
export const SUBJECT_NAME_CONSTRAINTS = {
  /** 科目名の最小長 */
  MIN_LENGTH: 1,
  /** 科目名の最大長 */
  MAX_LENGTH: 20,
} as const;

/** 科目名の型定義 */
export type SubjectNameLength =
  | typeof SUBJECT_NAME_CONSTRAINTS.MIN_LENGTH
  | typeof SUBJECT_NAME_CONSTRAINTS.MAX_LENGTH;
