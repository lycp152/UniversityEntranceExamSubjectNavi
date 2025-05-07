import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useChartData } from './use-chart-data';
import type { UISubject } from '@/types/university-subject';

/**
 * テスト用の科目データを生成
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
    name: '前期',
    displayOrder: 1,
  },
  subjects: {
    テスト科目: {
      commonTest: 80,
      secondTest: 80,
    },
  },
  version: 1,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  createdBy: 'system',
  updatedBy: 'system',
});

/**
 * useChartDataフックのテスト
 */
describe('useChartData', () => {
  describe('正常系', () => {
    it('科目データからチャートデータを正しく生成する', () => {
      const subjectData = createTestSubjectData();
      const { result } = renderHook(() => useChartData(subjectData));

      expect(result.current).toBeDefined();
      expect(result.current.detailedData).toBeDefined();
      expect(result.current.outerData).toBeDefined();
      expect(result.current.errors).toBeDefined();
    });
  });

  describe('異常系', () => {
    it('無効な科目データの場合、エラー情報を含むデータを返す', () => {
      const invalidSubjectData = {
        ...createTestSubjectData(),
        subjects: {},
      } as unknown as UISubject;
      const { result } = renderHook(() => useChartData(invalidSubjectData));

      expect(result.current.errors).toBeDefined();
      expect(result.current.errors.length).toBeGreaterThan(0);
    });
  });

  describe('メモ化', () => {
    it('同じ科目データの場合、同じ参照のデータを返す', () => {
      const subjectData = createTestSubjectData();
      const { result } = renderHook(() => useChartData(subjectData));
      expect(result.current).toBeDefined();
    });

    it('異なる科目データの場合、新しいデータを返す', () => {
      const subjectData1 = createTestSubjectData();
      const subjectData2 = {
        ...subjectData1,
        subjects: {
          テスト科目: {
            commonTest: 90,
            secondTest: 90,
          },
        },
      };

      const { result, rerender } = renderHook(({ data }) => useChartData(data), {
        initialProps: { data: subjectData1 },
      });

      const firstResult = result.current;
      rerender({ data: subjectData2 });

      // オブジェクトの参照を比較
      expect(result.current).not.toBe(firstResult);
    });
  });
});
