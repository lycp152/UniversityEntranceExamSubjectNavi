import { SUBJECTS } from "@/constants/subjects";

type SubjectNameDisplayMapping = typeof SUBJECTS;

/**
 * 科目名を表示用にフォーマットする
 */
export const formatSubjectName = (
  subjectName: keyof SubjectNameDisplayMapping
): string => {
  return SUBJECTS[subjectName] || subjectName;
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
