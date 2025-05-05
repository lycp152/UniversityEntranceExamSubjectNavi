import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useUniversityData } from './use-university-data';
import type { University } from '@/features/admin/types/university';
import type { AdmissionScheduleName } from '@/constants/constraint/admission-schedule';
import type { ExamTypeName } from '@/constants/constraint/exam-types';
import type { AdmissionStatus } from '@/constants/constraint/admission-info';

/**
 * 大学データフックのテスト
 *
 * このテストスイートでは、大学データを取得・管理するカスタムフックの
 * 動作と状態管理を検証します。
 *
 * @module use-university-data.test
 */

// モックの設定
vi.mock('@/features/admin/utils/api-transformers', () => ({
  transformAPIResponse: vi.fn(data => data),
  transformToAPITestType: vi.fn(data => data),
}));

// テストデータ
const mockUniversityData: University[] = [
  {
    id: 1,
    name: '東京大学',
    version: 1,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    createdBy: 'system',
    updatedBy: 'system',
    departments: [
      {
        id: 1,
        name: '理学部',
        universityId: 1,
        version: 1,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        createdBy: 'system',
        updatedBy: 'system',
        majors: [
          {
            id: 1,
            name: '数学科',
            departmentId: 1,
            version: 1,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
            createdBy: 'system',
            updatedBy: 'system',
            admissionSchedules: [
              {
                id: 1,
                name: '前' as AdmissionScheduleName,
                majorId: 1,
                displayOrder: 0,
                version: 1,
                createdAt: '2024-01-01T00:00:00Z',
                updatedAt: '2024-01-01T00:00:00Z',
                createdBy: 'system',
                updatedBy: 'system',
                testTypes: [
                  {
                    id: 1,
                    name: '共通' as ExamTypeName,
                    admissionScheduleId: 1,
                    version: 1,
                    createdAt: '2024-01-01T00:00:00Z',
                    updatedAt: '2024-01-01T00:00:00Z',
                    createdBy: 'system',
                    updatedBy: 'system',
                    subjects: [
                      {
                        id: 1,
                        name: '数学',
                        score: 100,
                        percentage: 50,
                        displayOrder: 1,
                        testTypeId: 1,
                        version: 1,
                        createdAt: '2024-01-01T00:00:00Z',
                        updatedAt: '2024-01-01T00:00:00Z',
                        createdBy: 'system',
                        updatedBy: 'system',
                      },
                    ],
                  },
                ],
                admissionInfos: [
                  {
                    id: 1,
                    admissionScheduleId: 1,
                    academicYear: 2024,
                    enrollment: 100,
                    status: 'draft' as AdmissionStatus,
                    version: 1,
                    createdAt: '2024-01-01T00:00:00Z',
                    updatedAt: '2024-01-01T00:00:00Z',
                    createdBy: 'system',
                    updatedBy: 'system',
                    testTypes: [
                      {
                        id: 1,
                        name: '共通' as ExamTypeName,
                        admissionScheduleId: 1,
                        version: 1,
                        createdAt: '2024-01-01T00:00:00Z',
                        updatedAt: '2024-01-01T00:00:00Z',
                        createdBy: 'system',
                        updatedBy: 'system',
                        subjects: [
                          {
                            id: 1,
                            name: '数学',
                            score: 100,
                            percentage: 50,
                            displayOrder: 1,
                            testTypeId: 1,
                            version: 1,
                            createdAt: '2024-01-01T00:00:00Z',
                            updatedAt: '2024-01-01T00:00:00Z',
                            createdBy: 'system',
                            updatedBy: 'system',
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
      },
    ],
  },
];

describe('useUniversityData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('正常に大学データを取得できること', async () => {
    // モックの設定
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockUniversityData),
    } as Response);

    const { result } = renderHook(() => useUniversityData());

    // 初期状態の確認
    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBe(null);
    expect(result.current.universities).toEqual([]);

    // データ取得完了を待機
    await act(async () => {
      await result.current.fetchUniversities();
    });

    // 最終状態の確認
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.universities).toEqual(mockUniversityData);
  });

  it('APIエラーが発生した場合にエラーを返すこと', async () => {
    // モックの設定
    vi.mocked(global.fetch).mockRejectedValueOnce(new Error('APIエラー'));

    const { result } = renderHook(() => useUniversityData());

    await act(async () => {
      await result.current.fetchUniversities();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe('APIエラー');
    expect(result.current.universities).toEqual([]);
  });

  it('大学情報を更新できること', async () => {
    // モックの設定
    const updatedUniversity = { ...mockUniversityData[0], name: '東京大学（更新）' };
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(updatedUniversity),
    } as Response);

    const { result } = renderHook(() => useUniversityData());

    await act(async () => {
      await result.current.updateUniversity(updatedUniversity, {});
    });

    expect(result.current.error).toBe(null);
  });

  it('学部情報を更新できること', async () => {
    // モックの設定
    const university = mockUniversityData[0];
    const department = university.departments[0];
    const updatedDepartment = { ...department, name: '理学部（更新）' };

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(updatedDepartment),
    } as Response);

    const { result } = renderHook(() => useUniversityData());

    await act(async () => {
      await result.current.updateDepartment(university, updatedDepartment, {});
    });

    expect(result.current.error).toBe(null);
  });

  it('科目情報を更新できること', async () => {
    // モックの設定
    const university = mockUniversityData[0];
    const department = university.departments[0];

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    } as Response);

    const { result } = renderHook(() => useUniversityData());

    await act(async () => {
      await result.current.updateSubjects(university, department, {});
    });

    expect(result.current.error).toBe(null);
  });
});
