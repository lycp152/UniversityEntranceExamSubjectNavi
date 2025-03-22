import { SUBJECT_NAME_DISPLAY_MAPPING } from "@/constants/subjects";

type SubjectNameDisplayMapping = typeof SUBJECT_NAME_DISPLAY_MAPPING;

/**
 * 科目名を表示用にフォーマットする
 */
export const formatSubjectName = (
  subjectName: keyof SubjectNameDisplayMapping
): string => {
  return SUBJECT_NAME_DISPLAY_MAPPING[subjectName] || subjectName;
};

/**
 * スコアを表示用にフォーマットする
 */
export const formatScore = (score: number): string => {
  return score.toFixed(1);
};

/**
 * パーセンテージを表示用にフォーマットする
 */
export const formatPercentage = (percentage: number): string => {
  return `${(percentage * 100).toFixed(1)}%`;
};
