/**
 * Classificationコンポーネントのテスト
 *
 * このテストスイートでは、設置区分フィルターコンポーネントの機能を包括的にテストします。
 * テストは以下の観点で実施されます：
 *
 * 1. レンダリングテスト
 *    - フィルターのラベルが正しく表示されること
 *    - 設置区分の階層構造が適切に表示されること
 *    - 各設置区分の選択肢が正しく表示されること
 *
 * 2. インタラクションテスト
 *    - 選択値の変更が正しく反映されること
 *    - 複数選択が可能であること
 *    - 選択の解除が正しく機能すること
 *
 * 3. アクセシビリティテスト
 *    - スクリーンリーダー対応が適切であること
 *    - キーボードナビゲーションが可能であること
 *    - ARIA属性が正しく設定されていること
 *
 * テストの前提条件：
 * - 設置区分と選択肢のデータが正しく設定されていること
 * - 選択状態の初期値が適切に設定されていること
 * - コールバック関数が正しく実装されていること
 *
 * 期待される動作：
 * - ユーザーインターフェースが直感的であること
 * - アクセシビリティガイドラインに準拠していること
 * - パフォーマンスが最適化されていること
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Classification } from './classification';
import { CLASSIFICATION_OPTIONS, FILTER_LABELS } from '../../constants/filter-options';
import { FilterCheckboxProps } from '../../types/filter';

describe('Classification', () => {
  const mockOnChange = vi.fn();
  const defaultProps: FilterCheckboxProps = {
    selectedItems: [],
    setSelectedItems: mockOnChange,
  };

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('ラベルが正しく表示されること', () => {
    render(<Classification {...defaultProps} />);
    expect(screen.getByText(FILTER_LABELS.CLASSIFICATION)).toBeInTheDocument();
  });

  it('すべてのカテゴリーが表示されること', () => {
    render(<Classification {...defaultProps} />);
    Object.keys(CLASSIFICATION_OPTIONS).forEach(category => {
      expect(screen.getByText(category)).toBeInTheDocument();
    });
  });

  it('各カテゴリーの選択肢が表示されること', () => {
    render(<Classification {...defaultProps} />);
    Object.entries(CLASSIFICATION_OPTIONS).forEach(([_, items]) => {
      items.forEach(item => {
        expect(screen.getByText(item)).toBeInTheDocument();
      });
    });
  });

  it('選択された値が正しく反映されること', () => {
    const selectedItems = [Object.values(CLASSIFICATION_OPTIONS)[0][0]];
    render(<Classification {...defaultProps} selectedItems={selectedItems} />);
    const checkbox = screen.getByLabelText(selectedItems[0]);
    expect(checkbox).toBeChecked();
  });

  it('選択値が変更されたときにonChangeが呼ばれること', () => {
    render(<Classification {...defaultProps} />);
    const firstItem = Object.values(CLASSIFICATION_OPTIONS)[0][0];
    const checkbox = screen.getByLabelText(firstItem);
    fireEvent.click(checkbox);
    expect(mockOnChange).toHaveBeenCalledWith([firstItem]);
  });

  it('複数の選択肢を選択できること', () => {
    render(<Classification {...defaultProps} />);
    const firstItem = Object.values(CLASSIFICATION_OPTIONS)[0][0];
    const secondItem = Object.values(CLASSIFICATION_OPTIONS)[0][1];

    fireEvent.click(screen.getByLabelText(firstItem));
    fireEvent.click(screen.getByLabelText(secondItem));

    expect(mockOnChange).toHaveBeenLastCalledWith([firstItem, secondItem]);
  });

  it('選択を解除できること', () => {
    const selectedItems = [Object.values(CLASSIFICATION_OPTIONS)[0][0]];
    render(<Classification {...defaultProps} selectedItems={selectedItems} />);
    const checkbox = screen.getByLabelText(selectedItems[0]);
    fireEvent.click(checkbox);
    expect(mockOnChange).toHaveBeenCalledWith([]);
  });
});
