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
  });

  it('編集モードを開始できること', () => {
    const { result } = renderHook(() => useUniversityEditor());

    act(() => {
      result.current.handleEdit(mockUniversity, mockUniversity.departments[0]);
    });

    expect(result.current.editMode).toEqual({
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

    expect(result.current.editMode).toBeNull();
    expect(result.current.error).toBeNull();
    expect(mockSetUniversities).toHaveBeenCalledWith(expect.any(Function));
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

    expect(result.current.error).toBeNull();
    expect(mockSetUniversities).toHaveBeenCalledWith(expect.any(Function));
  });

  it('科目を追加できること', () => {
    const { result } = renderHook(() => useUniversityEditor());
    const mockTestType: APITestType = {
      id: 1,
      name: '共通',
      admissionScheduleId: 1,
      version: 1,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      createdBy: 'system',
      updatedBy: 'system',
      subjects: [],
    };

    act(() => {
      result.current.handleAddSubject(
        mockUniversity.id,
        mockUniversity.departments[0].id,
        mockTestType
      );
    });

    expect(result.current.error).toBeNull();
    expect(mockSetUniversities).toHaveBeenCalledWith(expect.any(Function));
  });

  it('科目名を変更できること', () => {
    const { result } = renderHook(() => useUniversityEditor());

    act(() => {
      result.current.handleSubjectNameChange(
        mockUniversity.id,
        mockUniversity.departments[0].id,
        1,
        '新しい科目名'
      );
    });

    expect(result.current.error).toBeNull();
    expect(mockSetUniversities).toHaveBeenCalledWith(expect.any(Function));
  });

  it('新規追加モードを開始できること', () => {
    const { result } = renderHook(() => useUniversityEditor());

    act(() => {
      result.current.handleInsert(0);
    });

    expect(result.current.editMode).toEqual({
      universityId: expect.any(Number),
      departmentId: expect.any(Number),
      isEditing: true,
      isNew: true,
      insertIndex: 0,
    });
    expect(mockSetUniversities).toHaveBeenCalledWith(expect.any(Function));
  });

  it('保存時にエラーが発生した場合に適切に処理されること', async () => {
    const { result } = renderHook(() => useUniversityEditor());
    const error = new Error('テストエラー');
    mockUpdateUniversity.mockRejectedValueOnce(error);

    await act(async () => {
      await result.current.handleSave(mockUniversity, mockUniversity.departments[0]);
    });

    expect(mockSetError).toHaveBeenCalledWith(error.message);
    expect(mockSetIsLoading).toHaveBeenCalledWith(false);
  });

  it('保存が成功した場合に適切に処理されること', async () => {
    const { result } = renderHook(() => useUniversityEditor());

    await act(async () => {
      await result.current.handleSave(mockUniversity, mockUniversity.departments[0]);
    });

    expect(mockSetSuccessMessage).toHaveBeenCalledWith('データが正常に更新されました');
    expect(mockSetIsLoading).toHaveBeenCalledWith(false);
    expect(mockFetchUniversities).toHaveBeenCalled();
  });
});
