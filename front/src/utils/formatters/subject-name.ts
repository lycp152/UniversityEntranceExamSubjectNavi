import { SUBJECTS } from "@/constants/subjects";

type SubjectNameDisplayMapping = typeof SUBJECTS;
type SubjectName = keyof SubjectNameDisplayMapping;
type TestType = "commonTest" | "secondTest";

/**
 * 科目名から基本カテゴリを抽出する
 */
export const extractSubjectMainCategory = (subjectName: string): string => {
  return subjectName.replace(/[RL]$/, "");
};

/**
 * 科目名から表示名を取得する
 */
export const getSubjectDisplayName = (subjectName: SubjectName): string => {
  return SUBJECTS[subjectName] || subjectName;
};

/**
 * 科目名を表示用にフォーマットする
 * 定義済みの表示名マッピングを使用
 */
export const formatSubjectName = (subjectName: SubjectName): string => {
  return SUBJECTS[subjectName] || subjectName;
};

/**
 * 科目名から数字などのプレフィックスを除去する
 * 例: '1英語R' -> '英語R'
 */
export const removeSubjectNamePrefix = (subjectName: string): string => {
  return subjectName.replace(/^[^RLa-z]+/, "");
};

/**
 * 科目名と試験区分から表示用の文字列を生成する
 */
export const formatSubjectNameWithTestType = (
  subjectName: string,
  testType: TestType
): string => {
  return `${subjectName}（${testType}）`;
};
