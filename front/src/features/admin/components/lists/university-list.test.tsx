import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UniversityList } from './university-list';
import type { University } from '@/features/admin/types/university';

// モックデータ
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
  {
    id: 2,
    name: 'テスト大学2',
    departments: [],
    version: 1,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    createdBy: 'test-user',
    updatedBy: 'test-user',
  },
];

// モック関数
const mockOnEdit = vi.fn();
const mockOnSave = vi.fn();
const mockOnCancel = vi.fn();
const mockOnScoreChange = vi.fn();
const mockOnInfoChange = vi.fn();
const mockOnInsert = vi.fn();
const mockOnAddSubject = vi.fn();
const mockOnSubjectNameChange = vi.fn();

describe('UniversityList', () => {
  it('通常モードで大学リストが正しく表示されること', () => {
    render(
      <UniversityList
        universities={mockUniversities}
        editMode={null}
        onEdit={mockOnEdit}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        onScoreChange={mockOnScoreChange}
        onInfoChange={mockOnInfoChange}
        onInsert={mockOnInsert}
        onAddSubject={mockOnAddSubject}
        onSubjectNameChange={mockOnSubjectNameChange}
      />
    );

    // 大学名が表示されていることを確認
    expect(screen.getByRole('article', { name: 'テスト大学1の情報' })).toBeInTheDocument();
    expect(screen.getByRole('article', { name: 'テスト大学2の情報' })).toBeInTheDocument();

    // 挿入ボタンが表示されていることを確認
    expect(screen.getAllByRole('button', { name: /追加/ })).toHaveLength(3);
  });

  it('編集モードで大学リストが正しく表示されること', () => {
    const editMode = {
      isEditing: true,
      editingUniversityId: 1,
      universityId: 1,
      departmentId: 1,
    };

    render(
      <UniversityList
        universities={mockUniversities}
        editMode={editMode}
        onEdit={mockOnEdit}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        onScoreChange={mockOnScoreChange}
        onInfoChange={mockOnInfoChange}
        onInsert={mockOnInsert}
        onAddSubject={mockOnAddSubject}
        onSubjectNameChange={mockOnSubjectNameChange}
      />
    );

    // 大学名が表示されていることを確認
    expect(screen.getByRole('article', { name: 'テスト大学1の情報' })).toBeInTheDocument();
    expect(screen.getByRole('article', { name: 'テスト大学2の情報' })).toBeInTheDocument();

    // 挿入ボタンが表示されていないことを確認
    expect(screen.queryByRole('button', { name: /追加/ })).not.toBeInTheDocument();
  });

  it('空の大学リストが正しく表示されること', () => {
    render(
      <UniversityList
        universities={[]}
        editMode={null}
        onEdit={mockOnEdit}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        onScoreChange={mockOnScoreChange}
        onInfoChange={mockOnInfoChange}
        onInsert={mockOnInsert}
        onAddSubject={mockOnAddSubject}
        onSubjectNameChange={mockOnSubjectNameChange}
      />
    );

    // 大学が表示されていないことを確認
    expect(screen.queryByRole('article', { name: 'テスト大学1の情報' })).not.toBeInTheDocument();
    expect(screen.queryByRole('article', { name: 'テスト大学2の情報' })).not.toBeInTheDocument();

    // 挿入ボタンが1つだけ表示されていることを確認
    expect(screen.getAllByRole('button', { name: /追加/ })).toHaveLength(1);
  });
});
