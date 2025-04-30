import { describe, it, expect } from 'vitest';
import type { SubjectScore } from './subject-scores';
import type { ExamTypeName } from '@/constants/constraint/exam-types';
import type { SubjectName } from '@/constants/constraint/subjects/subjects';

/**
 * 科目スコアの型テスト
 *
 * @remarks
 * - 科目スコアの型定義のテスト
 * - 科目データの表示に関する型のテスト
 */

describe('SubjectScore', () => {
  it('正しい型のプロパティを持つべき', () => {
    const subjectScore: SubjectScore = {
      id: 1,
      name: 'MATH' as SubjectName,
      type: 'COMMON_TEST' as ExamTypeName,
      value: 80,
      category: 'SCIENCE',
      testTypeId: 1,
      percentage: 80,
      displayOrder: 1,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'test',
      updatedBy: 'test',
    };

    expect(subjectScore).toBeDefined();
    expect(typeof subjectScore.id).toBe('number');
    expect(typeof subjectScore.name).toBe('string');
    expect(typeof subjectScore.type).toBe('string');
    expect(typeof subjectScore.value).toBe('number');
    expect(typeof subjectScore.category).toBe('string');
    expect(typeof subjectScore.testTypeId).toBe('number');
    expect(typeof subjectScore.percentage).toBe('number');
    expect(typeof subjectScore.displayOrder).toBe('number');
    expect(typeof subjectScore.version).toBe('number');
    expect(typeof subjectScore.createdAt).toBe('string');
    expect(typeof subjectScore.updatedAt).toBe('string');
    expect(typeof subjectScore.createdBy).toBe('string');
    expect(typeof subjectScore.updatedBy).toBe('string');
  });

  it('必須プロパティを持つべき', () => {
    const subjectScore: SubjectScore = {
      id: 1,
      name: 'MATH' as SubjectName,
      type: 'COMMON_TEST' as ExamTypeName,
      value: 80,
      category: 'SCIENCE',
      testTypeId: 1,
      percentage: 80,
      displayOrder: 1,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'test',
      updatedBy: 'test',
    };

    expect(subjectScore).toBeDefined();
    expect(subjectScore.id).toBeDefined();
    expect(subjectScore.name).toBeDefined();
    expect(subjectScore.type).toBeDefined();
    expect(subjectScore.value).toBeDefined();
    expect(subjectScore.category).toBeDefined();
    expect(subjectScore.testTypeId).toBeDefined();
    expect(subjectScore.percentage).toBeDefined();
    expect(subjectScore.displayOrder).toBeDefined();
    expect(subjectScore.version).toBeDefined();
    expect(subjectScore.createdAt).toBeDefined();
    expect(subjectScore.updatedAt).toBeDefined();
    expect(subjectScore.createdBy).toBeDefined();
    expect(subjectScore.updatedBy).toBeDefined();
  });
});
