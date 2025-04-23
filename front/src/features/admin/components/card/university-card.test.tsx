import { render, screen, fireEvent } from '@testing-library/react';
import { UniversityCard } from './university-card';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { University } from '@/features/admin/types/university';

/**
 * テスト用のダミーデータ
 */
const mockUniversity: University = {
  id: 1,
  name: 'テスト大学',
  version: 1,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  createdBy: 'test-user',
  updatedBy: 'test-user',
  departments: [
    {
      id: 1,
      name: 'テスト学部',
      universityId: 1,
      version: 1,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      createdBy: 'test-user',
      updatedBy: 'test-user',
      majors: [
        {
          id: 1,
          name: 'テスト学科',
          departmentId: 1,
          version: 1,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          createdBy: 'test-user',
          updatedBy: 'test-user',
          admissionSchedules: [
            {
              id: 1,
              majorId: 1,
              name: '前',
              displayOrder: 0,
              testTypes: [],
              version: 1,
              createdAt: '2024-01-01T00:00:00Z',
              updatedAt: '2024-01-01T00:00:00Z',
              createdBy: 'test-user',
              updatedBy: 'test-user',
              admissionInfos: [
                {
                  id: 1,
                  admissionScheduleId: 1,
                  academicYear: 2024,
                  enrollment: 100,
                  status: 'draft',
                  testTypes: [],
                  version: 1,
                  createdAt: '2024-01-01T00:00:00Z',
                  updatedAt: '2024-01-01T00:00:00Z',
                  createdBy: 'test-user',
                  updatedBy: 'test-user',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

/**
 * テスト用のモック関数
 */
const mockHandlers = {
  onEdit: vi.fn(),
  onSave: vi.fn(),
  onCancel: vi.fn(),
  onScoreChange: vi.fn(),
  onInfoChange: vi.fn(),
  onAddSubject: vi.fn(),
  onSubjectNameChange: vi.fn(),
};

/**
 * UniversityCardコンポーネントのテスト
 *
 * このテストスイートは、大学カードコンポーネントの
 * 表示、インタラクション、アクセシビリティを検証します。
 */
describe('UniversityCard', () => {
  beforeEach(() => {
    // window.confirmのモック化
    vi.spyOn(window, 'confirm').mockImplementation(() => true);
  });

  /**
   * 表示テスト
   * コンポーネントの表示状態を検証します。
   */
  describe('表示', () => {
    it('大学情報が正しく表示される', () => {
      render(<UniversityCard university={mockUniversity} editMode={null} {...mockHandlers} />);

      expect(screen.getByText('テスト大学')).toBeInTheDocument();
      expect(screen.getByText(/テスト学部.*テスト学科/)).toBeInTheDocument();
      expect(screen.getByText(/日程:.*前/)).toBeInTheDocument();
      expect(screen.getByText(/募集人数:.*100人/)).toBeInTheDocument();
    });

    it('編集モードで表示された場合、編集ボタンが表示される', () => {
      render(
        <UniversityCard
          university={mockUniversity}
          editMode={{
            universityId: 1,
            departmentId: 1,
            isEditing: true,
          }}
          {...mockHandlers}
        />
      );

      expect(screen.getByRole('button', { name: /保存/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /キャンセル/i })).toBeInTheDocument();
    });
  });

  /**
   * インタラクションテスト
   * コンポーネントのユーザーインタラクションを検証します。
   */
  describe('インタラクション', () => {
    it('編集ボタンをクリックするとonEditが呼ばれる', () => {
      render(<UniversityCard university={mockUniversity} editMode={null} {...mockHandlers} />);

      const editButton = screen.getByRole('button', { name: /編集/i });
      fireEvent.click(editButton);

      expect(mockHandlers.onEdit).toHaveBeenCalledTimes(1);
      expect(mockHandlers.onEdit).toHaveBeenCalledWith(
        mockUniversity,
        mockUniversity.departments[0]
      );
    });

    it('保存ボタンをクリックするとonSaveが呼ばれる', () => {
      render(
        <UniversityCard
          university={mockUniversity}
          editMode={{
            universityId: 1,
            departmentId: 1,
            isEditing: true,
          }}
          {...mockHandlers}
        />
      );

      const saveButton = screen.getByRole('button', { name: /保存/i });
      fireEvent.click(saveButton);

      expect(mockHandlers.onSave).toHaveBeenCalledTimes(1);
      expect(mockHandlers.onSave).toHaveBeenCalledWith(
        mockUniversity,
        mockUniversity.departments[0]
      );
    });
  });

  /**
   * アクセシビリティテスト
   * コンポーネントのアクセシビリティ要件を検証します。
   */
  describe('アクセシビリティ', () => {
    it('適切なARIA属性を持つ', () => {
      render(<UniversityCard university={mockUniversity} editMode={null} {...mockHandlers} />);

      const card = screen.getByRole('article');
      expect(card).toHaveAttribute('aria-label', 'テスト大学の情報');
    });
  });
});
