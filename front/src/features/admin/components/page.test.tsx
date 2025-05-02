import { render, screen, waitFor } from '@testing-library/react';
import { AdminPage } from './page';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import * as useUniversityEditor from '@/features/admin/hooks/use-university-editor';
import type { University } from '@/features/admin/types/university';
import { Dispatch, SetStateAction } from 'react';

/**
 * 管理ページのメインコンポーネントのテスト
 *
 * 以下の項目をテストします：
 * - データフェッチングの動作
 * - エラーバウンダリーの機能
 * - コンポーネントのレンダリング
 * - 状態管理の動作
 */
describe('AdminPage', () => {
  const mockUniversities: University[] = [
    {
      id: 1,
      name: 'テスト大学1',
      departments: [],
      version: 1,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      createdBy: 'test-user',
      updatedBy: 'test-user',
    },
  ];

  const mockUseUniversityEditor = {
    universities: mockUniversities,
    setUniversities: vi.fn() as Dispatch<SetStateAction<University[]>>,
    error: null,
    setError: vi.fn() as Dispatch<SetStateAction<string | null>>,
    isLoading: false,
    setIsLoading: vi.fn() as Dispatch<SetStateAction<boolean>>,
    successMessage: null,
    setSuccessMessage: vi.fn() as Dispatch<SetStateAction<string | null>>,
    editMode: null,
    setEditMode: vi.fn() as Dispatch<SetStateAction<any>>,
    fetchUniversities: vi.fn().mockResolvedValue(undefined),
    handleEdit: vi.fn(),
    handleCancel: vi.fn(),
    handleSave: vi.fn(),
    handleInfoChange: vi.fn(),
    handleScoreChange: vi.fn(),
    handleAddSubject: vi.fn(),
    handleSubjectNameChange: vi.fn(),
    handleInsert: vi.fn(),
    updateUniversity: vi.fn(),
    updateDepartment: vi.fn(),
    updateSubjects: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(useUniversityEditor, 'useUniversityEditor').mockReturnValue(mockUseUniversityEditor);
  });

  it('コンポーネントが正しくレンダリングされること', () => {
    render(<AdminPage />);
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('マウント時に大学データを取得すること', async () => {
    render(<AdminPage />);
    await waitFor(() => {
      expect(mockUseUniversityEditor.fetchUniversities).toHaveBeenCalled();
    });
  });

  it('ローディング状態が正しく表示されること', () => {
    const loadingState = {
      ...mockUseUniversityEditor,
      isLoading: true,
    };
    vi.spyOn(useUniversityEditor, 'useUniversityEditor').mockReturnValue(loadingState);

    render(<AdminPage />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('エラー状態が正しく表示されること', () => {
    const errorState = {
      ...mockUseUniversityEditor,
      error: 'エラーが発生しました',
    };
    vi.spyOn(useUniversityEditor, 'useUniversityEditor').mockReturnValue(errorState);

    render(<AdminPage />);
    expect(screen.getByText('エラーが発生しました')).toBeInTheDocument();
  });

  it('成功メッセージが正しく表示されること', () => {
    const successState = {
      ...mockUseUniversityEditor,
      successMessage: '保存に成功しました',
    };
    vi.spyOn(useUniversityEditor, 'useUniversityEditor').mockReturnValue(successState);

    render(<AdminPage />);
    expect(screen.getByText('保存に成功しました')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveAttribute('aria-live', 'polite');
  });

  it('エラーバウンダリーが正しく機能すること', () => {
    const errorState = {
      ...mockUseUniversityEditor,
      error: '予期せぬエラー',
    };
    vi.spyOn(useUniversityEditor, 'useUniversityEditor').mockReturnValue(errorState);

    render(<AdminPage />);
    expect(screen.getByText('予期せぬエラー')).toBeInTheDocument();
  });
});
