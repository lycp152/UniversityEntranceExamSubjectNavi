import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useCategoryData } from './use-chart-category-data';
import type { UISubject } from '@/types/university-subject';
import { SUBJECTS } from '@/constants/constraint/subjects/subjects';

/**
 * テスト用のモックデータ
 */
const mockSubjectData: UISubject = {
  id: 1,
  name: 'テスト科目',
  score: 240,
  percentage: 100,
  displayOrder: 1,
  testTypeId: 1,
  version: 1,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  deletedAt: null,
  createdBy: 'test',
  updatedBy: 'test',
  university: {
    id: 1,
    name: 'テスト大学',
  },
  department: {
    id: 1,
    name: 'テスト学部',
  },
  major: {
    id: 1,
    name: 'テスト学科',
  },
  examInfo: {
    id: 1,
    enrollment: 100,
    academicYear: 2024,
    status: 'active',
  },
  admissionSchedule: {
    id: 1,
    name: 'テスト日程',
    displayOrder: 1,
  },
  subjects: {
    math: { commonTest: 80, secondTest: 0 },
    english: { commonTest: 70, secondTest: 0 },
    japanese: { commonTest: 90, secondTest: 0 },
  },
};

/**
 * テスト用のカテゴリ合計計算関数
 */
const mockCalculateCategoryTotal = vi.fn((subjects, category) => {
  switch (category) {
    case '英語':
      return subjects.english.commonTest + subjects.english.secondTest;
    case '数学':
      return subjects.math.commonTest + subjects.math.secondTest;
    case '国語':
      return subjects.japanese.commonTest + subjects.japanese.secondTest;
    case '理科':
      return 0;
    case '地歴公':
      return 0;
    default:
      return 0;
  }
});

/**
 * カテゴリデータフックのテスト
 *
 * @remarks
 * - 正常系のテスト
 * - エラーハンドリングのテスト
 * - パフォーマンスのテスト
 */
describe('useCategoryData', () => {
  it('正常なデータで正しくカテゴリデータを生成すること', () => {
    const { result } = renderHook(() =>
      useCategoryData(mockSubjectData, 240, mockCalculateCategoryTotal)
    );

    expect(result.current.status).toBe('success');
    expect(result.current.hasErrors).toBe(false);
    expect(result.current.data).toHaveLength(5);
    expect(result.current.data[0]).toMatchObject({
      name: '英語',
      value: 70,
    });
    expect(result.current.data[1]).toMatchObject({
      name: '数学',
      value: 80,
    });
    expect(result.current.data[2]).toMatchObject({
      name: '国語',
      value: 90,
    });
    expect(result.current.data[3]).toMatchObject({
      name: '理科',
      value: 0,
    });
    expect(result.current.data[4]).toMatchObject({
      name: '地歴公',
      value: 0,
    });
  });

  it('負の値が含まれる場合にエラーを返すこと', () => {
    const negativeCalculateTotal = vi.fn(() => -10);
    const { result } = renderHook(() =>
      useCategoryData(mockSubjectData, 240, negativeCalculateTotal)
    );

    expect(result.current.status).toBe('error');
    expect(result.current.hasErrors).toBe(true);
    expect(result.current.errors).toHaveLength(1);
    expect(result.current.errors[0].message).toContain('負の値');
  });

  it('合計点を超える値が含まれる場合にエラーを返すこと', () => {
    const exceedCalculateTotal = vi.fn(() => 300);
    const { result } = renderHook(() =>
      useCategoryData(mockSubjectData, 240, exceedCalculateTotal)
    );

    expect(result.current.status).toBe('error');
    expect(result.current.hasErrors).toBe(true);
    expect(result.current.errors).toHaveLength(1);
    expect(result.current.errors[0].message).toContain('全体の合計を超えています');
  });

  it('メモ化が正しく機能すること', () => {
    const { result, rerender } = renderHook(() =>
      useCategoryData(mockSubjectData, 240, mockCalculateCategoryTotal)
    );

    const firstResult = result.current;
    rerender();
    expect(result.current).toBe(firstResult);
  });

  it('メタデータが正しく生成されること', () => {
    const { result } = renderHook(() =>
      useCategoryData(mockSubjectData, 240, mockCalculateCategoryTotal)
    );

    expect(result.current.metadata).toBeDefined();
    expect(result.current.metadata?.processedAt).toBeGreaterThan(0);
    expect(result.current.metadata?.totalItems).toBe(Object.values(SUBJECTS).length);
  });
});
