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

import { TestType } from '@/types/score';
import { FORMAT_PATTERNS, SUBJECTS } from '@/constants/subjects';

type SubjectNameDisplayMapping = typeof SUBJECTS;
type SubjectName = keyof SubjectNameDisplayMapping;

/**
 * 科目名から基本カテゴリを抽出
 * @param subjectName - 科目名
 * @returns 基本カテゴリ名
 * @example
 * - "英語R" -> "英語"
 * - "数学L" -> "数学"
 */
export const extractSubjectMainCategory = (subjectName: string): string => {
  return subjectName.replace(/[RL]$/, '');
};

/**
 * 科目名から数字などのプレフィックスを除去
 * @param subjectName - 科目名
 * @returns プレフィックスを除去した科目名
 * @example
 * - "1英語R" -> "英語R"
 * - "2数学L" -> "数学L"
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
 * - "数学L" -> "数学"
 */
export const formatSubjectName = (subjectName: SubjectName): string => {
  return SUBJECTS[subjectName] || subjectName;
};

/**
 * 科目名とテストタイプを組み合わせて表示用の文字列を生成
 * @param name - 科目名
 * @param testType - テスト種別
 * @returns テスト種別を含む表示用の科目名
 * @example
 * - "英語", "共通" -> "英語（共通）"
 * - "数学", "二次" -> "数学（二次）"
 */
export const formatWithTestType = (name: string, testType: TestType): string => {
  return FORMAT_PATTERNS.TEST_TYPE(name, testType);
};
