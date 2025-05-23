import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import { BasicInfo } from './basic-info';
import type { BasicInfoProps } from '@/features/admin/types/basic-info';
import { ADMISSION_SCHEDULE_CONSTRAINTS } from '@/constants/constraint/admission-schedule';

/**
 * テスト用の情報データを作成します
 */
const createTestBasicInfo = (): BasicInfoProps => {
  const major = {
    id: 1,
    name: '情報学科',
    departmentId: 1,
    version: 1,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    createdBy: 'test',
    updatedBy: 'test',
    admissionSchedules: [],
  };

  const admissionSchedule = {
    id: 1,
    name: '前' as const,
    majorId: 1,
    displayOrder: ADMISSION_SCHEDULE_CONSTRAINTS.MIN_DISPLAY_ORDER,
    version: 1,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    createdBy: 'test',
    updatedBy: 'test',
    admissionInfos: [],
    testTypes: [],
  };

  const admissionInfo = {
    id: 1,
    admissionScheduleId: 1,
    academicYear: 2024,
    enrollment: 100,
    status: 'published' as const,
    version: 1,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    createdBy: 'test',
    updatedBy: 'test',
    testTypes: [],
  };

  return {
    university: {
      id: 1,
      name: 'テスト大学',
      departments: [],
      version: 1,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      createdBy: 'test',
      updatedBy: 'test',
    },
    department: {
      id: 1,
      name: '情報学部',
      universityId: 1,
      version: 1,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      createdBy: 'test',
      updatedBy: 'test',
      majors: [major],
    },
    major,
    admissionSchedule,
    admissionInfo,
    isEditing: false,
    onInfoChange: vi.fn(),
  };
};

describe('BasicInfo', () => {
  describe('表示モード', () => {
    it('大学名、学部名、学科名、日程、募集人数が正しく表示されること', () => {
      const props = createTestBasicInfo();
      render(<BasicInfo {...props} />);

      expect(screen.getByText('テスト大学')).toBeInTheDocument();
      expect(screen.getByText('情報学部 - 情報学科')).toBeInTheDocument();
      expect(screen.getByText('日程: 前期')).toBeInTheDocument();
      expect(screen.getByText('募集人数: 100人')).toBeInTheDocument();
    });
  });

  describe('編集モード', () => {
    it('編集可能な入力フィールドが表示されること', () => {
      const props = { ...createTestBasicInfo(), isEditing: true };
      render(<BasicInfo {...props} />);

      expect(screen.getByDisplayValue('テスト大学')).toBeInTheDocument();
      expect(screen.getByDisplayValue('情報学部')).toBeInTheDocument();
      expect(screen.getByDisplayValue('情報学科')).toBeInTheDocument();
      expect(screen.getByRole('combobox')).toHaveTextContent('前');
      expect(screen.getByDisplayValue('100')).toBeInTheDocument();
    });

    it('大学名を変更できること', () => {
      const props = { ...createTestBasicInfo(), isEditing: true };
      render(<BasicInfo {...props} />);

      const input = screen.getByDisplayValue('テスト大学');
      fireEvent.change(input, { target: { value: '新しい大学' } });

      expect(props.onInfoChange).toHaveBeenCalledWith('universityName', '新しい大学');
    });

    it('学部名を変更できること', () => {
      const props = { ...createTestBasicInfo(), isEditing: true };
      render(<BasicInfo {...props} />);

      const input = screen.getByDisplayValue('情報学部');
      fireEvent.change(input, { target: { value: '工学部' } });

      expect(props.onInfoChange).toHaveBeenCalledWith('departmentName', '工学部');
    });

    it('学科名を変更できること', () => {
      const props = { ...createTestBasicInfo(), isEditing: true };
      render(<BasicInfo {...props} />);

      const input = screen.getByDisplayValue('情報学科');
      fireEvent.change(input, { target: { value: '情報工学科' } });

      expect(props.onInfoChange).toHaveBeenCalledWith('majorName', '情報工学科');
    });

    it('日程を変更できること', () => {
      const props = { ...createTestBasicInfo(), isEditing: true };
      render(<BasicInfo {...props} />);

      const select = screen.getByRole('combobox');
      fireEvent.click(select);
      const option = screen.getByText('後');
      fireEvent.click(option);

      expect(props.onInfoChange).toHaveBeenCalledWith('schedule', '後');
    });

    it('募集人数を変更できること', () => {
      const props = { ...createTestBasicInfo(), isEditing: true };
      render(<BasicInfo {...props} />);

      const input = screen.getByDisplayValue('100');
      fireEvent.change(input, { target: { value: '150' } });

      expect(props.onInfoChange).toHaveBeenCalledWith('enrollment', 150);
    });

    it('表示順序が範囲外の場合は変更を無視すること', () => {
      const props = { ...createTestBasicInfo(), isEditing: true };
      render(<BasicInfo {...props} />);

      const input = screen.getByDisplayValue('100');
      fireEvent.change(input, { target: { value: '-1' } });

      expect(props.onInfoChange).toHaveBeenCalledWith('enrollment', -1);
    });
  });

  describe('アクセシビリティ', () => {
    it('入力フィールドに適切なラベルが設定されていること', () => {
      const props = { ...createTestBasicInfo(), isEditing: true };
      render(<BasicInfo {...props} />);

      expect(screen.getByLabelText('日程')).toBeInTheDocument();
      expect(screen.getByLabelText('募集人数')).toBeInTheDocument();
    });

    it('セレクトボックスが適切なARIA属性を持っていること', () => {
      const props = { ...createTestBasicInfo(), isEditing: true };
      render(<BasicInfo {...props} />);

      const select = screen.getByRole('combobox');
      expect(select).toHaveAttribute('aria-expanded', 'false');
      expect(select).toHaveAttribute('aria-haspopup', 'listbox');
    });

    it('入力フィールドが適切なARIA属性を持っていること', () => {
      const props = { ...createTestBasicInfo(), isEditing: true };
      render(<BasicInfo {...props} />);

      const inputs = screen.getAllByRole('textbox');
      inputs.forEach(input => {
        expect(input).toHaveAttribute('aria-label');
      });
    });

    it('数値入力フィールドが適切なARIA属性を持っていること', () => {
      const props = { ...createTestBasicInfo(), isEditing: true };
      render(<BasicInfo {...props} />);

      const numberInput = screen.getByRole('spinbutton');
      expect(numberInput).toHaveAttribute('aria-label', '募集人数');
      expect(numberInput).toHaveAttribute('aria-valuemin', '0');
    });
  });
});
