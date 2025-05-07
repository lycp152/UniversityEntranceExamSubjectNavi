/**
 * 大学一覧の型定義のテスト
 *
 * @module university-list.test
 * @description
 * university-list.tsの型定義が正しく機能することを確認するテストです。
 * - 編集モードの型定義の検証
 * - 編集ボタンのプロパティ型の検証
 * - 行のプロパティ型の検証
 * - 大学一覧のプロパティ型の検証
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { EditMode, EditButtonsProps, RowProps, UniversityListProps } from './university-list';
import type { University, Department } from '@/features/admin/types/university';
import type { APITestType } from '@/types/api/types';

describe('EditMode', () => {
  let editMode: EditMode;

  beforeEach(() => {
    editMode = {
      universityId: 1,
      departmentId: 1,
      isEditing: true,
    };
  });

  it('必須プロパティが正しく定義されていること', () => {
    expect(editMode).toBeDefined();
    expect(editMode.universityId).toBe(1);
    expect(editMode.departmentId).toBe(1);
    expect(editMode.isEditing).toBe(true);
  });

  it('オプショナルプロパティが正しく定義されていること', () => {
    const editModeWithOptional: EditMode = {
      ...editMode,
      isNew: true,
      insertIndex: 0,
    };
    expect(editModeWithOptional.isNew).toBe(true);
    expect(editModeWithOptional.insertIndex).toBe(0);
  });

  it('オプショナルプロパティが未定義の場合でも正しく動作すること', () => {
    expect(editMode.isNew).toBeUndefined();
    expect(editMode.insertIndex).toBeUndefined();
  });
});

describe('EditButtonsProps', () => {
  let props: EditButtonsProps;

  beforeEach(() => {
    props = {
      isEditing: true,
      onEdit: () => {},
      onSave: () => {},
      onCancel: () => {},
    };
  });

  it('必須プロパティが正しく定義されていること', () => {
    expect(props).toBeDefined();
    expect(props.isEditing).toBe(true);
    expect(typeof props.onEdit).toBe('function');
    expect(typeof props.onSave).toBe('function');
    expect(typeof props.onCancel).toBe('function');
  });

  it('コールバック関数が正しく動作すること', () => {
    const mockOnEdit = vi.fn();
    const mockOnSave = vi.fn();
    const mockOnCancel = vi.fn();

    props = {
      ...props,
      onEdit: mockOnEdit,
      onSave: mockOnSave,
      onCancel: mockOnCancel,
    };

    props.onEdit();
    props.onSave();
    props.onCancel();

    expect(mockOnEdit).toHaveBeenCalledTimes(1);
    expect(mockOnSave).toHaveBeenCalledTimes(1);
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });
});

describe('RowProps', () => {
  const mockUniversity: University = {
    id: 1,
    name: 'テスト大学',
    departments: [],
    createdAt: '',
    updatedAt: '',
    version: 1,
    createdBy: '',
    updatedBy: '',
  };

  const mockDepartment: Department = {
    id: 1,
    universityId: 1,
    name: 'テスト学部',
    majors: [],
    createdAt: '',
    updatedAt: '',
    version: 1,
    createdBy: '',
    updatedBy: '',
  };

  let props: RowProps;

  beforeEach(() => {
    props = {
      university: mockUniversity,
      department: mockDepartment,
      isEditing: true,
      onEdit: () => {},
      onSave: async () => undefined,
      onCancel: () => {},
      onInfoChange: () => {},
      onScoreChange: async () => {},
      onAddSubject: () => {},
      onSubjectNameChange: () => {},
      showEditButton: true,
    };
  });

  it('必須プロパティが正しく定義されていること', () => {
    expect(props).toBeDefined();
    expect(props.university).toEqual(mockUniversity);
    expect(props.department).toEqual(mockDepartment);
    expect(props.isEditing).toBe(true);
    expect(typeof props.onEdit).toBe('function');
    expect(typeof props.onSave).toBe('function');
    expect(typeof props.onCancel).toBe('function');
    expect(typeof props.onInfoChange).toBe('function');
    expect(typeof props.onScoreChange).toBe('function');
    expect(typeof props.onAddSubject).toBe('function');
    expect(typeof props.onSubjectNameChange).toBe('function');
    expect(props.showEditButton).toBe(true);
  });

  it('コールバック関数が正しく動作すること', () => {
    const mockOnEdit = vi.fn();
    const mockOnSave = vi.fn();
    const mockOnCancel = vi.fn();
    const mockOnInfoChange = vi.fn();
    const mockOnScoreChange = vi.fn();
    const mockOnAddSubject = vi.fn();
    const mockOnSubjectNameChange = vi.fn();

    props = {
      ...props,
      onEdit: mockOnEdit,
      onSave: mockOnSave,
      onCancel: mockOnCancel,
      onInfoChange: mockOnInfoChange,
      onScoreChange: mockOnScoreChange,
      onAddSubject: mockOnAddSubject,
      onSubjectNameChange: mockOnSubjectNameChange,
    };

    props.onEdit(mockUniversity, mockDepartment);
    props.onSave(mockUniversity, mockDepartment);
    props.onCancel();
    props.onInfoChange(1, 1, 'name', 'テスト');
    props.onScoreChange(1, 1, 1, 100, true);
    props.onAddSubject(1, 1, 'common' as APITestType);
    props.onSubjectNameChange(1, 1, 1, 'テスト科目');

    expect(mockOnEdit).toHaveBeenCalledTimes(1);
    expect(mockOnSave).toHaveBeenCalledTimes(1);
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
    expect(mockOnInfoChange).toHaveBeenCalledTimes(1);
    expect(mockOnScoreChange).toHaveBeenCalledTimes(1);
    expect(mockOnAddSubject).toHaveBeenCalledTimes(1);
    expect(mockOnSubjectNameChange).toHaveBeenCalledTimes(1);
  });
});

describe('UniversityListProps', () => {
  let props: UniversityListProps;
  let mockUniversity: University;
  let mockDepartment: Department;

  beforeEach(() => {
    mockUniversity = {
      id: 1,
      name: 'テスト大学',
      departments: [],
      createdAt: '',
      updatedAt: '',
      version: 1,
      createdBy: '',
      updatedBy: '',
    };

    mockDepartment = {
      id: 1,
      universityId: 1,
      name: 'テスト学部',
      majors: [],
      createdAt: '',
      updatedAt: '',
      version: 1,
      createdBy: '',
      updatedBy: '',
    };

    props = {
      universities: [],
      editMode: null,
      onInsert: () => {},
      onEdit: () => {},
      onSave: async () => undefined,
      onCancel: () => {},
      onInfoChange: () => {},
      onScoreChange: async () => {},
      onAddSubject: () => {},
      onSubjectNameChange: () => {},
    };
  });

  it('必須プロパティが正しく定義されていること', () => {
    expect(props).toBeDefined();
    expect(Array.isArray(props.universities)).toBe(true);
    expect(props.editMode).toBeNull();
    expect(typeof props.onInsert).toBe('function');
    expect(typeof props.onEdit).toBe('function');
    expect(typeof props.onSave).toBe('function');
    expect(typeof props.onCancel).toBe('function');
    expect(typeof props.onInfoChange).toBe('function');
    expect(typeof props.onScoreChange).toBe('function');
    expect(typeof props.onAddSubject).toBe('function');
    expect(typeof props.onSubjectNameChange).toBe('function');
  });

  it('コールバック関数が正しく動作すること', () => {
    const mockOnInsert = vi.fn();
    const mockOnEdit = vi.fn();
    const mockOnSave = vi.fn();
    const mockOnCancel = vi.fn();
    const mockOnInfoChange = vi.fn();
    const mockOnScoreChange = vi.fn();
    const mockOnAddSubject = vi.fn();
    const mockOnSubjectNameChange = vi.fn();

    props = {
      ...props,
      onInsert: mockOnInsert,
      onEdit: mockOnEdit,
      onSave: mockOnSave,
      onCancel: mockOnCancel,
      onInfoChange: mockOnInfoChange,
      onScoreChange: mockOnScoreChange,
      onAddSubject: mockOnAddSubject,
      onSubjectNameChange: mockOnSubjectNameChange,
    };

    props.onInsert(0);
    props.onEdit(mockUniversity, mockDepartment);
    props.onSave(mockUniversity, mockDepartment);
    props.onCancel();
    props.onInfoChange(1, 1, 'name', 'テスト');
    props.onScoreChange(1, 1, 1, 100, true);
    props.onAddSubject(1, 1, 'common' as APITestType);
    props.onSubjectNameChange(1, 1, 1, 'テスト科目');

    expect(mockOnInsert).toHaveBeenCalledTimes(1);
    expect(mockOnEdit).toHaveBeenCalledTimes(1);
    expect(mockOnSave).toHaveBeenCalledTimes(1);
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
    expect(mockOnInfoChange).toHaveBeenCalledTimes(1);
    expect(mockOnScoreChange).toHaveBeenCalledTimes(1);
    expect(mockOnAddSubject).toHaveBeenCalledTimes(1);
    expect(mockOnSubjectNameChange).toHaveBeenCalledTimes(1);
  });
});
