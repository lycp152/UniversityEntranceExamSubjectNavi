import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useUniversityData } from './use-university-data';
import { UniversityService } from '@/features/universities/utils/university-service';
import { findDepartmentAndMajor } from '@/features/universities/utils/university-finder';
import { transformSubjectData } from '@/utils/subject-data-transformer';
import { UniversityPageParams } from '@/features/universities/types/params';
import type { APIDepartment, APIMajor } from '@/types/api/types';
import { UniversityDataError } from '@/features/universities/utils/university-errors';

// モックの設定
vi.mock('@/features/universities/utils/university-service');
vi.mock('@/features/universities/utils/university-finder');
vi.mock('@/utils/subject-data-transformer');

// テストデータ
const mockParams: UniversityPageParams = {
  academicYear: '2024',
  universityId: '1',
  departmentId: '1',
  majorId: '1',
  schedule: '1',
};

const mockUniversityData = {
  id: 1,
  name: '東京大学',
  departments: [
    {
      id: 1,
      name: '理学部',
      majors: [
        {
          id: 1,
          name: '数学科',
          admission_schedules: [
            {
              id: 1,
              name: '前期',
              admission_infos: [
                {
                  id: 1,
                  academic_year: 2024,
                  status: 'active',
                },
              ],
              test_types: [
                {
                  id: 1,
                  name: '一般入試',
                  subjects: [
                    {
                      id: 1,
                      name: '数学',
                      score: 100,
                      percentage: 50,
                      display_order: 1,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

const mockTransformedSubject = {
  id: 1,
  version: 1,
  name: '数学',
  score: 100,
  percentage: 50,
  displayOrder: 1,
  testTypeId: 1,
  university: {
    id: 1,
    name: '東京大学',
  },
  department: {
    id: 1,
    name: '理学部',
  },
  major: {
    id: 1,
    name: '数学科',
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
  subjects: {},
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  createdBy: 'system',
  updatedBy: 'system',
};

describe('useUniversityData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // UniversityServiceのモックを設定
    vi.mocked(UniversityService.getUniversity).mockResolvedValue(mockUniversityData);
    // findDepartmentAndMajorのモックを設定
    vi.mocked(findDepartmentAndMajor).mockReturnValue({
      department: mockUniversityData.departments[0] as APIDepartment,
      major: mockUniversityData.departments[0].majors[0] as APIMajor,
    });
    // transformSubjectDataのモックを設定
    vi.mocked(transformSubjectData).mockReturnValue(mockTransformedSubject);
  });

  describe('正常系', () => {
    it('データ取得成功時は正しい科目データを返すこと', async () => {
      const { result } = renderHook(() => useUniversityData(mockParams));

      // 初期状態の確認
      expect(result.current.loading).toBe(true);
      expect(result.current.error).toBeNull();
      expect(result.current.selectedSubject).toBeNull();

      // 非同期処理の完了を待つ
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // 結果の確認
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.selectedSubject).toEqual(mockTransformedSubject);
      expect(result.current.selectedSubject?.name).toBe('数学');
      expect(result.current.selectedSubject?.score).toBe(100);
    });
  });

  describe('異常系', () => {
    it('学部または学科が見つからない場合はエラーを返すこと', async () => {
      // findDepartmentAndMajorのモックをエラーを投げるように設定
      vi.mocked(findDepartmentAndMajor).mockImplementation(() => {
        throw new UniversityDataError('学部または学科が見つかりません');
      });

      const { result } = renderHook(() => useUniversityData(mockParams));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe('学部または学科が見つかりません');
      expect(result.current.selectedSubject).toBeNull();
    });

    it('入試日程が見つからない場合はエラーを返すこと', async () => {
      // 入試日程を空にする
      const mockDataWithoutSchedule = {
        ...mockUniversityData,
        departments: [
          {
            ...mockUniversityData.departments[0],
            majors: [
              {
                ...mockUniversityData.departments[0].majors[0],
                admission_schedules: [],
              },
            ],
          },
        ],
      };
      vi.mocked(UniversityService.getUniversity).mockResolvedValue(mockDataWithoutSchedule);
      vi.mocked(findDepartmentAndMajor).mockReturnValue({
        department: mockDataWithoutSchedule.departments[0] as APIDepartment,
        major: mockDataWithoutSchedule.departments[0].majors[0] as APIMajor,
      });

      const { result } = renderHook(() => useUniversityData(mockParams));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe('入試日程が見つかりません');
      expect(result.current.selectedSubject).toBeNull();
    });

    it('APIエラー発生時はエラーメッセージを返すこと', async () => {
      // UniversityServiceのモックをエラーを投げるように設定
      vi.mocked(UniversityService.getUniversity).mockRejectedValue(new Error('APIエラー'));

      const { result } = renderHook(() => useUniversityData(mockParams));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe('APIエラー');
      expect(result.current.selectedSubject).toBeNull();
    });
  });
});
