import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useUniversityEditor } from './use-university-editor';
import type { University } from '@/features/admin/types/university';
import type { APITestType } from '@/types/api/types';

/**
 * 大学データ編集フックのテスト
 *
 * このテストスイートでは、大学データの編集機能を提供するカスタムフックの
 * 動作と状態管理を検証します。
 *
 * @module use-university-editor.test
 */

// モックの設定
const mockSetUniversities = vi.fn();
const mockSetError = vi.fn();
const mockSetIsLoading = vi.fn();
const mockSetSuccessMessage = vi.fn();
const mockFetchUniversities = vi.fn();
const mockUpdateUniversity = vi.fn();
const mockUpdateDepartment = vi.fn();
const mockUpdateSubjects = vi.fn();
const mockUpdateMajor = vi.fn();
const mockUpdateAdmissionSchedule = vi.fn();
const mockUpdateAdmissionInfo = vi.fn();
const mockCalculateUpdatedSubjects = vi.fn();

// テストデータ
const mockUniversity: University = {
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
      majors: [],
    },
  ],
};

vi.mock('@/features/admin/hooks/use-university-data', () => ({
  useUniversityData: () => ({
    universities: [mockUniversity],
    setUniversities: mockSetUniversities,
    error: null,
    setError: mockSetError,
    isLoading: false,
    setIsLoading: mockSetIsLoading,
    successMessage: null,
    setSuccessMessage: mockSetSuccessMessage,
    fetchUniversities: mockFetchUniversities,
    updateUniversity: mockUpdateUniversity,
    updateDepartment: mockUpdateDepartment,
    updateSubjects: mockUpdateSubjects,
    updateMajor: mockUpdateMajor,
    updateAdmissionSchedule: mockUpdateAdmissionSchedule,
    updateAdmissionInfo: mockUpdateAdmissionInfo,
  }),
}));

vi.mock('@/features/admin/hooks/use-subject-data', () => ({
  useSubjectData: () => ({
    calculateUpdatedSubjects: mockCalculateUpdatedSubjects,
  }),
}));

describe('useUniversityEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSetUniversities.mockClear();
    mockSetError.mockClear();
    mockSetIsLoading.mockClear();
    mockSetSuccessMessage.mockClear();
    mockFetchUniversities.mockClear();
    mockUpdateUniversity.mockClear();
    mockUpdateDepartment.mockClear();
    mockUpdateSubjects.mockClear();
    mockUpdateMajor.mockClear();
    mockUpdateAdmissionSchedule.mockClear();
    mockUpdateAdmissionInfo.mockClear();
    mockCalculateUpdatedSubjects.mockClear();
  });

  it('編集モードを開始できること', () => {
    const { result } = renderHook(() => useUniversityEditor());

    act(() => {
      result.current.handleEdit(mockUniversity, mockUniversity.departments[0]);
    });

    expect(result.current.editMode, '編集モードの状態が不正です').toEqual({
      universityId: mockUniversity.id,
      departmentId: mockUniversity.departments[0].id,
      isEditing: true,
    });
  });

  it('編集をキャンセルできること', () => {
    const { result } = renderHook(() => useUniversityEditor());

    act(() => {
      result.current.handleEdit(mockUniversity, mockUniversity.departments[0]);
    });

    act(() => {
      result.current.handleCancel();
    });

    expect(result.current.editMode, '編集モードが正しく解除されていません').toBeNull();
    expect(result.current.error, 'エラー状態が正しくクリアされていません').toBeNull();
    expect(mockSetUniversities, 'バックアップ状態の復元が実行されていません').toHaveBeenCalledWith(
      expect.any(Function)
    );
  });

  it('大学情報を更新できること', () => {
    const { result } = renderHook(() => useUniversityEditor());

    act(() => {
      result.current.handleInfoChange(
        mockUniversity.id,
        mockUniversity.departments[0].id,
        'name',
        '東京大学（更新）'
      );
    });

    expect(result.current.error, 'エラーが発生しています').toBeNull();
    expect(mockSetUniversities, '大学情報の更新が実行されていません').toHaveBeenCalledWith(
      expect.any(Function)
    );
  });

  it('科目を追加できること', () => {
    const { result } = renderHook(() => useUniversityEditor());
    const mockTestType: APITestType = {
      id: 1,
      name: '共通テスト',
      subjects: [],
      displayOrder: 1,
      createdAt: new Date().toString(),
      updatedAt: new Date().toString(),
      version: 1,
      createdBy: '',
      updatedBy: '',
    };

    act(() => {
      result.current.handleAddSubject(
        mockUniversity.id,
        mockUniversity.departments[0].id,
        mockTestType
      );
    });

    expect(result.current.error, 'エラーが発生しています').toBeNull();
    expect(mockSetUniversities, '科目の追加が実行されていません').toHaveBeenCalledWith(
      expect.any(Function)
    );
  });

  it('保存時にエラーが発生した場合に適切に処理されること', async () => {
    const { result } = renderHook(() => useUniversityEditor());
    const error = new Error('テストエラー');
    mockUpdateUniversity.mockRejectedValueOnce(error);

    await act(async () => {
      await result.current.handleSave(mockUniversity, mockUniversity.departments[0]);
    });

    expect(mockSetError, 'エラーメッセージが設定されていません').toHaveBeenCalledWith(
      error.message
    );
    expect(mockSetIsLoading, 'ローディング状態が正しく解除されていません').toHaveBeenCalledWith(
      false
    );
  });

  it('スコア変更時にエラーが発生した場合に適切に処理されること', () => {
    const { result } = renderHook(() => useUniversityEditor());
    const error = new Error('スコア更新エラー');
    mockSetUniversities.mockImplementationOnce(() => {
      throw error;
    });

    act(() => {
      result.current.handleScoreChange(1, 1, 1, 100, true);
    });

    expect(mockSetError, 'エラーメッセージが設定されていません').toHaveBeenCalledWith(
      '点数の更新に失敗しました。'
    );
  });

  it('新規追加時に空の大学データが正しく作成されること', () => {
    const { result } = renderHook(() => useUniversityEditor());

    act(() => {
      result.current.handleInsert(0);
    });

    expect(mockSetUniversities, '新規大学データの作成が実行されていません').toHaveBeenCalledWith(
      expect.any(Function)
    );
    const setUniversitiesCallback = mockSetUniversities.mock.calls[0][0];
    const newUniversities = setUniversitiesCallback([mockUniversity]);

    expect(newUniversities[0], '大学データの基本構造が不正です').toEqual({
      id: expect.any(Number),
      name: '大学',
      departments: expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(Number),
          name: '学部',
          universityId: expect.any(Number),
          majors: expect.arrayContaining([
            expect.objectContaining({
              id: expect.any(Number),
              name: '学科',
              departmentId: expect.any(Number),
              admissionSchedules: expect.arrayContaining([
                expect.objectContaining({
                  id: expect.any(Number),
                  name: '前',
                  majorId: expect.any(Number),
                  displayOrder: 0,
                  testTypes: expect.arrayContaining([
                    expect.objectContaining({
                      id: expect.any(Number),
                      name: '共通',
                      admissionScheduleId: expect.any(Number),
                      subjects: [],
                      version: 1,
                      createdAt: expect.any(String),
                      updatedAt: expect.any(String),
                      createdBy: '',
                      updatedBy: '',
                    }),
                    expect.objectContaining({
                      id: expect.any(Number),
                      name: '二次',
                      admissionScheduleId: expect.any(Number),
                      subjects: [],
                      version: 1,
                      createdAt: expect.any(String),
                      updatedAt: expect.any(String),
                      createdBy: '',
                      updatedBy: '',
                    }),
                  ]),
                  admissionInfos: expect.arrayContaining([
                    expect.objectContaining({
                      id: expect.any(Number),
                      admissionScheduleId: expect.any(Number),
                      academicYear: expect.any(Number),
                      enrollment: 0,
                      status: 'draft',
                      testTypes: [],
                      version: 1,
                      createdAt: expect.any(String),
                      updatedAt: expect.any(String),
                      createdBy: '',
                      updatedBy: '',
                    }),
                  ]),
                  version: 1,
                  createdAt: expect.any(String),
                  updatedAt: expect.any(String),
                  createdBy: '',
                  updatedBy: '',
                }),
              ]),
              version: 1,
              createdAt: expect.any(String),
              updatedAt: expect.any(String),
              createdBy: '',
              updatedBy: '',
            }),
          ]),
          version: 1,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          createdBy: '',
          updatedBy: '',
        }),
      ]),
      version: 1,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
      createdBy: '',
      updatedBy: '',
    });
  });
});
