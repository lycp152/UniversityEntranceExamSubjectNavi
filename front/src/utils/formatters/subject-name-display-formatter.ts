import { TestType } from '@/types/score';
import { FORMAT_PATTERNS, SUBJECTS } from '@/constants/subjects';

type SubjectNameDisplayMapping = typeof SUBJECTS;
type SubjectName = keyof SubjectNameDisplayMapping;

/**
 * 科目名から基本カテゴリを抽出する
 */
export const extractSubjectMainCategory = (subjectName: string): string => {
  return subjectName.replace(/[RL]$/, '');
};

/**
 * 科目名から数字などのプレフィックスを除去する
 */
export const removeSubjectNamePrefix = (subjectName: string): string => {
  return subjectName.replace(/^[^RLa-z]+/, '');
};

/**
 * 科目名を表示用にフォーマットする
 */
export const formatSubjectName = (subjectName: SubjectName): string => {
  return SUBJECTS[subjectName] || subjectName;
};

/**
 * 科目名とテストタイプを組み合わせて表示用の文字列を生成する
 */
export const formatWithTestType = (name: string, testType: TestType): string => {
  return FORMAT_PATTERNS.TEST_TYPE(name, testType);
};
