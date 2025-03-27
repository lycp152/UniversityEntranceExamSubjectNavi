import { EXAM_TYPES, SUBJECT_CATEGORIES } from "@/constants/subjects";

/**
 * 共通科目かどうかを判定
 */
export const isCommonSubject = (name: string): boolean =>
  name.includes(EXAM_TYPES.COMMON.name);

/**
 * 二次科目かどうかを判定
 */
export const isSecondarySubject = (name: string): boolean =>
  name.includes(EXAM_TYPES.SECONDARY.name);

/**
 * 科目名から基本カテゴリを取得
 */
export const getSubjectBaseCategory = (name: string): string => {
  const found = Object.values(SUBJECT_CATEGORIES).find((subject) =>
    name.includes(subject.category)
  );
  return found?.category ?? SUBJECT_CATEGORIES.ENGLISH.category;
};

/**
 * 科目の表示順を比較
 */
export const compareSubjectOrder = (a: string, b: string): number => {
  const aIndex = Object.values(SUBJECT_CATEGORIES).findIndex((subject) =>
    a.includes(subject.category)
  );
  const bIndex = Object.values(SUBJECT_CATEGORIES).findIndex((subject) =>
    b.includes(subject.category)
  );
  return aIndex - bIndex;
};
