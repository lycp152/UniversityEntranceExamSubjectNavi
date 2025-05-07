/**
 * InfoCombinerコンポーネントのテスト
 *
 * @remarks
 * - コンポーネントのレンダリングを検証
 * - データ変換ロジックを検証
 * - ユーザーインタラクションを検証
 * - エッジケースの処理を検証
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { InfoCombiner } from './info-combiner';
import type { RowProps } from '@/features/admin/types/university-list';
import type { UISubject } from '@/types/university-subject';
import { SUBJECTS } from '@/constants/constraint/subjects/subjects';
import { ADMISSION_SCHEDULE_CONSTRAINTS } from '@/constants/constraint/admission-schedule';
import { EXAM_TYPES } from '@/constants/constraint/exam-types';

// モックデータの作成
const mockUniversity = {
  id: 1,
  name: 'テスト大学',
  departments: [],
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  version: 1,
  createdBy: 'テストユーザー',
  updatedBy: 'テストユーザー',
};

const mockDepartment = {
  id: 1,
  name: 'テスト学部',
  universityId: 1,
  majors: [],
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  version: 1,
  createdBy: 'テストユーザー',
  updatedBy: 'テストユーザー',
};

const mockMajor = {
  id: 1,
  name: 'テスト学科',
  departmentId: 1,
  admissionSchedules: [],
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  version: 1,
  createdBy: 'テストユーザー',
  updatedBy: 'テストユーザー',
};

const mockAdmissionSchedule = {
  id: 1,
  name: ADMISSION_SCHEDULE_CONSTRAINTS.VALID_NAMES[0],
  majorId: 1,
  displayOrder: ADMISSION_SCHEDULE_CONSTRAINTS.DISPLAY_ORDER_CONSTRAINTS.MIN,
  testTypes: [],
  admissionInfos: [],
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  version: 1,
  createdBy: 'テストユーザー',
  updatedBy: 'テストユーザー',
};

const mockAdmissionInfo = {
  id: 1,
  admissionScheduleId: 1,
  academicYear: 2024,
  enrollment: 100,
  status: 'published' as const,
  testTypes: [],
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  version: 1,
  createdBy: 'テストユーザー',
  updatedBy: 'テストユーザー',
};

const mockTestType = {
  id: 1,
  name: EXAM_TYPES.COMMON.name,
  admissionScheduleId: 1,
  subjects: [],
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  version: 1,
  createdBy: 'テストユーザー',
  updatedBy: 'テストユーザー',
};

const mockSubject: UISubject = {
  id: 1,
  name: SUBJECTS.MATH,
  testTypeId: 1,
  score: 100,
  percentage: 1,
  displayOrder: ADMISSION_SCHEDULE_CONSTRAINTS.DISPLAY_ORDER_CONSTRAINTS.MIN,
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
    status: 'published',
  },
  admissionSchedule: {
    id: 1,
    name: ADMISSION_SCHEDULE_CONSTRAINTS.VALID_NAMES[0],
    displayOrder: ADMISSION_SCHEDULE_CONSTRAINTS.DISPLAY_ORDER_CONSTRAINTS.MIN,
  },
  subjects: {
    数学: {
      commonTest: 100,
      secondTest: 200,
    },
  },
  version: 1,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  createdBy: 'テストユーザー',
  updatedBy: 'テストユーザー',
};

describe('InfoCombiner', () => {
  const defaultProps: RowProps = {
    university: mockUniversity,
    department: {
      ...mockDepartment,
      majors: [
        {
          ...mockMajor,
          admissionSchedules: [
            {
              ...mockAdmissionSchedule,
              testTypes: [
                {
                  ...mockTestType,
                  subjects: [
                    {
                      ...mockSubject,
                      name: SUBJECTS.MATH,
                    },
                  ],
                },
              ],
              admissionInfos: [mockAdmissionInfo],
            },
          ],
        },
      ],
    },
    isEditing: false,
    onEdit: vi.fn(),
    onSave: vi.fn(),
    onCancel: vi.fn(),
    onScoreChange: vi.fn(),
    onInfoChange: vi.fn(),
    onAddSubject: vi.fn(),
    onSubjectNameChange: vi.fn(),
    showEditButton: true,
  };

  it('コンポーネントが正しくレンダリングされること', () => {
    render(<InfoCombiner {...defaultProps} />);

    // 大学名の表示を確認
    expect(screen.getByText('テスト大学')).toBeInTheDocument();

    // 学部名と学科名の表示を確認（より具体的なセレクタを使用）
    const departmentMajorText = screen.getByText(/テスト学部.*テスト学科/);
    expect(departmentMajorText).toBeInTheDocument();
  });

  it('編集モードで正しくレンダリングされること', () => {
    render(<InfoCombiner {...defaultProps} isEditing={true} />);

    // 編集ボタンが表示されないことを確認
    expect(screen.queryByRole('button', { name: '編集' })).not.toBeInTheDocument();
    // 保存ボタンが表示されることを確認
    expect(screen.getByRole('button', { name: '保存' })).toBeInTheDocument();
    // キャンセルボタンが表示されることを確認
    expect(screen.getByRole('button', { name: 'キャンセル' })).toBeInTheDocument();
  });

  it('編集ボタンクリック時にonEditが呼ばれること', () => {
    render(<InfoCombiner {...defaultProps} />);

    const editButton = screen.getByRole('button', { name: '編集' });
    fireEvent.click(editButton);

    expect(defaultProps.onEdit).toHaveBeenCalledWith(mockUniversity, defaultProps.department);
  });

  it('必須データが欠けている場合にnullを返すこと', () => {
    const propsWithoutRequiredData: RowProps = {
      ...defaultProps,
      department: {
        ...mockDepartment,
        majors: [],
      },
    };

    const { container } = render(<InfoCombiner {...propsWithoutRequiredData} />);
    expect(container.firstChild).toBeNull();
  });
});
