import { SUBJECT_TYPES, SUBJECTS, SUBJECT_ORDER } from "@/constants/subjects2";
import type { SubjectName } from "@/constants/subjects2";

/**
 * 共通科目かどうかを判定
 */
export const isCommonSubject = (name: string): boolean =>
  name.includes(SUBJECT_TYPES.COMMON);

/**
 * 二次科目かどうかを判定
 */
export const isSecondarySubject = (name: string): boolean =>
  name.includes(SUBJECT_TYPES.SECONDARY);

/**
 * 科目名から基本カテゴリーを取得
 */
export const getSubjectBaseCategory = (name: string): SubjectName => {
  return (
    SUBJECT_ORDER.find((subject) => name.includes(subject)) ?? SUBJECTS.ENGLISH
  );
};

/**
 * 科目の表示順を比較
 */
export const compareSubjectOrder = (a: string, b: string): number => {
  const aIndex = SUBJECT_ORDER.findIndex((subject) => a.includes(subject));
  const bIndex = SUBJECT_ORDER.findIndex((subject) => b.includes(subject));
  return aIndex - bIndex;
};
