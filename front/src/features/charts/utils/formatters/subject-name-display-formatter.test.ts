/**
 * 科目名の表示フォーマット処理のテスト
 * @module subject-name-display-formatter.test
 */

import { describe, it, expect } from 'vitest';
import { SUBJECTS, SubjectName } from '@/constants/constraint/subjects/subjects';
import { EXAM_TYPES, ExamType } from '@/constants/constraint/exam-types';
import {
  removeSubjectNamePrefix,
  formatSubjectName,
  formatWithTestType,
} from './subject-name-display-formatter';

describe('removeSubjectNamePrefix', () => {
  it('数字プレフィックスを除去できること', () => {
    expect(removeSubjectNamePrefix('1英語R')).toBe('R');
    expect(removeSubjectNamePrefix('2数学')).toBe('');
  });

  it('プレフィックスがない場合はそのまま返すこと', () => {
    expect(removeSubjectNamePrefix('英語R')).toBe('R');
    expect(removeSubjectNamePrefix('数学')).toBe('');
  });

  it('空文字列の場合は空文字列を返すこと', () => {
    expect(removeSubjectNamePrefix('')).toBe('');
  });
});

describe('formatSubjectName', () => {
  it('定義された科目名を正しくフォーマットできること', () => {
    expect(formatSubjectName('英語R' as SubjectName)).toBe(SUBJECTS.ENGLISH_R);
    expect(formatSubjectName('数学' as SubjectName)).toBe(SUBJECTS.MATH);
  });

  it('未定義の科目名はそのまま返すこと', () => {
    const undefinedSubject = '未定義科目' as SubjectName;
    expect(formatSubjectName(undefinedSubject)).toBe(undefinedSubject);
  });
});

describe('formatWithTestType', () => {
  it('共通テストの場合は正しくフォーマットできること', () => {
    const name = '英語';
    const testType = EXAM_TYPES.COMMON.name as ExamType;
    expect(formatWithTestType(name, testType)).toBe(`${name}(${EXAM_TYPES.COMMON.name})`);
  });

  it('二次テストの場合は正しくフォーマットできること', () => {
    const name = '数学';
    const testType = EXAM_TYPES.SECONDARY.name as ExamType;
    expect(formatWithTestType(name, testType)).toBe(`${name}(${EXAM_TYPES.SECONDARY.name})`);
  });

  it('科目名が空文字列の場合は空文字列でフォーマットすること', () => {
    const testType = EXAM_TYPES.COMMON.name as ExamType;
    expect(formatWithTestType('', testType)).toBe(`(${EXAM_TYPES.COMMON.name})`);
  });
});
