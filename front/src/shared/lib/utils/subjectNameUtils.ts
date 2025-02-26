import { VALID_SUBJECT_NAME_PATTERN, SUBJECT_NAME_DISPLAY_MAPPING } from '../constants/subjects';
import type { SubjectNameDisplayMapping, TestType, SubjectName } from '../types/models';

/**
 * 科目名から基本カテゴリーを抽出する
 */
export const extractSubjectMainCategory = (subjectName: string): string => {
  return subjectName.replace(/[RL]$/, '');
};

/**
 * 科目名が定義された命名パターンに従っているかを確認する
 * 例: '英語R', '数学', '国語' など
 */
export const isValidSubjectNamePattern = (subjectName: string): boolean => {
  return new RegExp(VALID_SUBJECT_NAME_PATTERN).test(subjectName);
};

/**
 * 科目名から表示名を取得する
 */
export const getSubjectDisplayName = (subjectName: SubjectName): string => {
  return SUBJECT_NAME_DISPLAY_MAPPING[subjectName] || subjectName;
};

/**
 * 科目名を表示用にフォーマットする
 * 定義済みの表示名マッピングを使用
 */
export const formatSubjectName = (subjectName: keyof SubjectNameDisplayMapping): string => {
  return SUBJECT_NAME_DISPLAY_MAPPING[subjectName] || subjectName;
};

/**
 * 科目名から数字などのプレフィックスを除去する
 * 例: '1英語R' -> '英語R'
 */
export const removeSubjectNamePrefix = (subjectName: string): string => {
  return subjectName.replace(/^[^RLa-z]+/, '');
};

/**
 * 科目名と試験区分から表示用の文字列を生成する
 */
export const formatSubjectNameWithTestType = (subjectName: string, testType: TestType): string => {
  return `${subjectName}（${testType}）`;
};
