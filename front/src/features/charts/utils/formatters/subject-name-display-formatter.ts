/**
 * 科目名の表示フォーマット処理
 * 科目名を表示用にフォーマット
 *
 * @module subject-name-display-formatter
 * @description
 * - 科目名の基本カテゴリ抽出
 * - 科目名のプレフィックス除去
 * - 科目名の表示用フォーマット
 * - テストタイプとの組み合わせ
 */

import { SUBJECTS, SubjectName } from '@/constants/constraint/subjects/subjects';
import { FORMAT_PATTERNS } from '@/features/charts/constants/chart-format';
import { ExamType } from '@/constants/constraint/exam-types';

/**
 * 科目名から数字などのプレフィックスを除去
 * @param subjectName - 科目名
 * @returns プレフィックスを除去した科目名
 * @example
 * - "1英語R" -> "英語R"
 */
export const removeSubjectNamePrefix = (subjectName: string): string => {
  return subjectName.replace(/^[^RLa-z]+/, '');
};

/**
 * 科目名を表示用にフォーマット
 * @param subjectName - 科目名
 * @returns 表示用の科目名
 * @example
 * - "英語R" -> "英語"
 */
export const formatSubjectName = (subjectName: SubjectName): string => {
  return SUBJECTS[subjectName as keyof typeof SUBJECTS] || subjectName;
};

/**
 * 科目名とテストタイプを組み合わせて表示用の文字列を生成
 * @param name - 科目名
 * @param testType - テスト種別
 * @returns テスト種別を含む表示用の科目名
 * @example
 * - "数学", "二次" -> "数学（二次）"
 */
export const formatWithTestType = (name: string, testType: ExamType): string => {
  return FORMAT_PATTERNS.TEST_TYPE(name, testType);
};
