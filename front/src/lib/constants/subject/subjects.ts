export const SUBJECT_TYPES = {
  COMMON: '共通',
  SECONDARY: '二次',
} as const;

export const SUBJECTS = {
  ENGLISH: '英語',
  MATH: '数学',
  JAPANESE: '国語',
  SCIENCE: '理科',
  SOCIAL: '地歴公',
} as const;

export const SUBJECT_ORDER = [
  SUBJECTS.ENGLISH,
  SUBJECTS.MATH,
  SUBJECTS.JAPANESE,
  SUBJECTS.SCIENCE,
  SUBJECTS.SOCIAL,
] as const;

export const SUBJECT_CATEGORIES = {
  ENGLISH: '英語',
  MATH: '数学',
  SCIENCE: '理科',
  SOCIAL: '社会',
} as const;

export type SubjectName = (typeof SUBJECTS)[keyof typeof SUBJECTS];
export type SubjectCategory = (typeof SUBJECT_CATEGORIES)[keyof typeof SUBJECT_CATEGORIES];
