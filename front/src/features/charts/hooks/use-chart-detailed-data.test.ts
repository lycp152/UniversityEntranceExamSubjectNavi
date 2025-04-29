import { describe, expect, it } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useDetailedData } from './use-chart-detailed-data';
import type { UISubject } from '@/types/university-subject';
import { SUBJECTS } from '@/constants/constraint/subjects/subjects';

/**
 * テスト用の科目データを生成する関数
 */
const createTestSubjectData = (): UISubject => ({
  id: 1,
  name: 'テスト科目',
  score: 80,
  percentage: 80,
  displayOrder: 1,
  testTypeId: 1,
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
    [SUBJECTS.MATH]: {
      commonTest: 80,
      secondTest: 90,
    },
    [SUBJECTS.ENGLISH_R]: {
      commonTest: 70,
      secondTest: 85,
    },
  },
  version: 1,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  createdBy: 'test',
  updatedBy: 'test',
});

describe('useDetailedData', () => {
  it('正常系: 科目データから詳細な円グラフデータを正しく生成する', () => {
    const subjectData = createTestSubjectData();
    const totalScore = 100;

    const { result } = renderHook(() => useDetailedData(subjectData, totalScore));

    expect(result.current.data).toHaveLength(4); // 数学と英語の共通・二次試験
    expect(result.current.errors).toHaveLength(4); // 各科目のエラー情報
    expect(result.current.hasErrors).toBe(true);
    expect(result.current.status).toBe('success');
  });

  it('異常系: 無効な科目データが与えられた場合、エラー情報を返す', () => {
    const invalidSubjectData = {
      ...createTestSubjectData(),
      subjects: {
        [SUBJECTS.MATH]: {
          commonTest: -1, // 無効なスコア
          secondTest: 90,
        },
      },
    };
    const totalScore = 100;

    const { result } = renderHook(() => useDetailedData(invalidSubjectData, totalScore));

    expect(result.current.errors).toHaveLength(5); // 無効なスコアのエラー + 各科目のエラー情報
    expect(result.current.hasErrors).toBe(true);
    expect(result.current.status).toBe('success');
  });

  it('メモ化: 同じ科目データと合計点が与えられた場合、同じ参照を返す', () => {
    const subjectData = createTestSubjectData();
    const totalScore = 100;

    const { result, rerender } = renderHook(({ data, total }) => useDetailedData(data, total), {
      initialProps: { data: subjectData, total: totalScore },
    });

    const firstResult = result.current;

    rerender({ data: subjectData, total: totalScore });

    expect(result.current).toBe(firstResult);
  });

  it('メモ化: 異なる科目データが与えられた場合、新しいデータを返す', () => {
    const subjectData1 = createTestSubjectData();
    const subjectData2 = {
      ...createTestSubjectData(),
      subjects: {
        ...createTestSubjectData().subjects,
        [SUBJECTS.MATH]: {
          commonTest: 85,
          secondTest: 95,
        },
      },
    };
    const totalScore = 100;

    const { result, rerender } = renderHook(({ data, total }) => useDetailedData(data, total), {
      initialProps: { data: subjectData1, total: totalScore },
    });

    const firstResult = result.current;

    rerender({ data: subjectData2, total: totalScore });

    expect(result.current).not.toBe(firstResult);
  });
});
