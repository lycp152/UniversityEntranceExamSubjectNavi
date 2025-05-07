import { describe, expect, it } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSubjectChart } from './use-subject-chart';
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

describe('useSubjectChart', () => {
  it('正常系: 科目データからチャートデータを正しく生成する', () => {
    const subjectData = createTestSubjectData();

    const { result } = renderHook(() => useSubjectChart(subjectData));

    expect(result.current.subjectChart.detailedData).toHaveLength(4); // 数学と英語の共通・二次試験
    expect(result.current.subjectChart.outerData).toBeDefined();
    expect(result.current.examChart.detailedData).toBeDefined();
    expect(result.current.examChart.outerData).toBeDefined();
  });

  it('異常系: 無効な科目データが与えられた場合、適切に処理する', () => {
    const invalidSubjectData = {
      ...createTestSubjectData(),
      subjects: {
        [SUBJECTS.MATH]: {
          commonTest: -1, // 無効なスコア
          secondTest: 90,
        },
      },
    };

    const { result } = renderHook(() => useSubjectChart(invalidSubjectData));

    expect(result.current.subjectChart.detailedData).toBeDefined();
    expect(result.current.subjectChart.outerData).toBeDefined();
    expect(result.current.examChart.detailedData).toBeDefined();
    expect(result.current.examChart.outerData).toBeDefined();
  });

  it('メモ化: 同じ科目データが与えられた場合、同じ参照を返す', () => {
    const subjectData = createTestSubjectData();

    const { result, rerender } = renderHook(({ data }) => useSubjectChart(data), {
      initialProps: { data: subjectData },
    });

    const firstResult = result.current;

    rerender({ data: subjectData });

    expect(result.current).toStrictEqual(firstResult);
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

    const { result, rerender } = renderHook(({ data }) => useSubjectChart(data), {
      initialProps: { data: subjectData1 },
    });

    const firstResult = result.current;

    rerender({ data: subjectData2 });

    expect(result.current).not.toStrictEqual(firstResult);
  });
});
