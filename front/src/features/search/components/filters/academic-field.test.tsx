import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AcademicField } from './academic-field';
import { ACADEMIC_FIELD_OPTIONS, FILTER_LABELS } from '../../constants/filter-options';
import { FilterCheckboxProps } from '../../types/filter';

/**
 * AcademicFieldコンポーネントのテスト
 *
 * このテストスイートでは、学問系統フィルターコンポーネントの以下の機能をテストします：
 * - レンダリング
 *   - ラベルの表示
 *   - 選択肢の表示
 * - インタラクション
 *   - 選択値の変更
 *   - 複数選択
 *   - 選択の解除
 */
describe('AcademicField', () => {
  const mockOnChange = vi.fn();
  const defaultProps: FilterCheckboxProps = {
    selectedItems: [],
    setSelectedItems: mockOnChange,
  };

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('ラベルが正しく表示されること', () => {
    render(<AcademicField {...defaultProps} />);
    expect(screen.getByText(FILTER_LABELS.ACADEMIC_FIELD)).toBeInTheDocument();
  });

  it('すべての学問系統の選択肢が表示されること', () => {
    render(<AcademicField {...defaultProps} />);
    ACADEMIC_FIELD_OPTIONS.forEach(option => {
      expect(screen.getByText(option)).toBeInTheDocument();
    });
  });

  it('選択された値が正しく反映されること', () => {
    const selectedItems = [ACADEMIC_FIELD_OPTIONS[0]];
    render(<AcademicField {...defaultProps} selectedItems={selectedItems} />);
    const checkbox = screen.getByLabelText(ACADEMIC_FIELD_OPTIONS[0]);
    expect(checkbox).toBeChecked();
  });

  it('選択値が変更されたときにonChangeが呼ばれること', () => {
    render(<AcademicField {...defaultProps} />);
    const checkbox = screen.getByLabelText(ACADEMIC_FIELD_OPTIONS[0]);
    fireEvent.click(checkbox);
    expect(mockOnChange).toHaveBeenCalledWith([ACADEMIC_FIELD_OPTIONS[0]]);
  });

  it('複数の選択肢を選択できること', () => {
    render(<AcademicField {...defaultProps} />);
    const firstCheckbox = screen.getByLabelText(ACADEMIC_FIELD_OPTIONS[0]);
    const secondCheckbox = screen.getByLabelText(ACADEMIC_FIELD_OPTIONS[1]);

    fireEvent.click(firstCheckbox);
    fireEvent.click(secondCheckbox);

    expect(mockOnChange).toHaveBeenLastCalledWith([
      ACADEMIC_FIELD_OPTIONS[0],
      ACADEMIC_FIELD_OPTIONS[1],
    ]);
  });

  it('選択を解除できること', () => {
    const selectedItems = [ACADEMIC_FIELD_OPTIONS[0]];
    render(<AcademicField {...defaultProps} selectedItems={selectedItems} />);
    const checkbox = screen.getByLabelText(ACADEMIC_FIELD_OPTIONS[0]);

    fireEvent.click(checkbox);
    expect(mockOnChange).toHaveBeenCalledWith([]);
  });
});
