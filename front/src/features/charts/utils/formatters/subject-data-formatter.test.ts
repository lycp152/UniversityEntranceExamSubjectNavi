/**
 * 科目データのフォーマット処理のテスト
 * @module subject-data-formatter.test
 */

import { describe, it, expect } from 'vitest';
import { EXAM_TYPES, ExamType } from '@/constants/constraint/exam-types';
import { transformSubjectData } from './subject-data-formatter';

describe('transformSubjectData', () => {
  it('正常な科目名と二次のテスト種別で変換が成功すること', () => {
    const subjectName = '英語R';
    const testType = EXAM_TYPES.SECONDARY.name as ExamType;

    const result = transformSubjectData(subjectName, testType);

    expect(result).toEqual({
      name: '英語R(二次)',
      displayName: 'R(二次)',
      category: '英語',
      testTypeId: 0,
      percentage: 0,
      displayOrder: 0,
    });
  });

  it('正常な科目名と共通のテスト種別で変換が成功すること', () => {
    const subjectName = '英語R';
    const testType = EXAM_TYPES.COMMON.name as ExamType;

    const result = transformSubjectData(subjectName, testType);

    expect(result).toEqual({
      name: '英語R(共通)',
      displayName: 'R(共通)',
      category: '英語',
      testTypeId: 0,
      percentage: 0,
      displayOrder: 0,
    });
  });

  it('空の科目名でエラーが発生すること', () => {
    const subjectName = '';
    const testType = EXAM_TYPES.SECONDARY.name as ExamType;

    expect(() => transformSubjectData(subjectName, testType)).toThrow('科目名は必須です');
  });

  it('異なるテスト種別で正しく変換されること', () => {
    const subjectName = '英語R';
    const testType = EXAM_TYPES.SECONDARY.name as ExamType;

    const result = transformSubjectData(subjectName, testType);

    expect(result).toEqual({
      name: '英語R(二次)',
      displayName: 'R(二次)',
      category: '英語',
      testTypeId: 0,
      percentage: 0,
      displayOrder: 0,
    });
  });
});
