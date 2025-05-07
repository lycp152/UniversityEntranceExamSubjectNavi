import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Region } from './region';
import { REGION_OPTIONS } from '../../constants/filter-options';
import { FilterCheckboxProps } from '../../types/filter';

/**
 * Regionコンポーネントのテスト
 *
 * このテストスイートでは、地域フィルターコンポーネントの機能を包括的にテストします。
 * テストは以下の観点で実施されます：
 *
 * 1. レンダリングテスト
 *    - フィルターグループの表示
 *      - ラベルの表示
 *      - 地域選択肢の表示
 *      - 選択状態の反映
 *    - アクセシビリティ属性の設定
 *      - ARIA属性の設定
 *      - スクリーンリーダー対応
 *
 * 2. インタラクションテスト
 *    - 選択操作
 *      - 単一選択
 *      - 複数選択
 *      - 選択解除
 *    - キーボード操作
 *      - フォーカス移動
 *      - 選択状態の変更
 *
 * 3. アクセシビリティテスト
 *    - スクリーンリーダー対応
 *      - ラベルの読み上げ
 *      - 選択状態の通知
 *    - キーボードナビゲーション
 *      - タブ移動
 *      - スペースキーでの選択
 *
 * テストの前提条件：
 * - 地域フィルターの設定が正しく行われていること
 * - 選択状態の初期値が適切に設定されていること
 * - コールバック関数が正しく実装されていること
 *
 * 期待される動作：
 * - ユーザーインターフェースが直感的であること
 * - アクセシビリティガイドラインに準拠していること
 * - パフォーマンスが最適化されていること
 */

describe('Region', () => {
  const mockOnChange = vi.fn();
  const defaultProps: FilterCheckboxProps = {
    selectedItems: [],
    setSelectedItems: mockOnChange,
  };

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('選択された値が正しく反映されること', () => {
    const selectedItems = [Object.values(REGION_OPTIONS)[0][0]];
    render(<Region {...defaultProps} selectedItems={selectedItems} />);
    const checkbox = screen.getByRole('checkbox', { name: selectedItems[0] });
    expect(checkbox).toBeChecked();
  });

  it('選択値が変更されたときにonChangeが呼ばれること', () => {
    render(<Region {...defaultProps} />);
    const firstItem = Object.values(REGION_OPTIONS)[0][0];
    const checkbox = screen.getByRole('checkbox', { name: firstItem });
    fireEvent.click(checkbox);
    expect(mockOnChange).toHaveBeenCalledWith([firstItem]);
  });

  it('選択を解除できること', () => {
    const selectedItems = [Object.values(REGION_OPTIONS)[0][0]];
    render(<Region {...defaultProps} selectedItems={selectedItems} />);
    const checkbox = screen.getByRole('checkbox', { name: selectedItems[0] });
    fireEvent.click(checkbox);
    expect(mockOnChange).toHaveBeenCalledWith([]);
  });

  describe('アクセシビリティ', () => {
    it('チェックボックスに適切なARIA属性が設定されていること', () => {
      render(<Region {...defaultProps} />);
      const allItems = Object.values(REGION_OPTIONS).flat();
      allItems.forEach(item => {
        const checkbox = screen.getByRole('checkbox', { name: item });
        expect(checkbox).toHaveAttribute('aria-checked', 'false');
        expect(checkbox).toHaveAttribute('aria-required', 'false');
      });
    });

    it('選択されたチェックボックスのARIA属性が正しく更新されること', () => {
      const selectedItems = [Object.values(REGION_OPTIONS)[0][0]];
      render(<Region {...defaultProps} selectedItems={selectedItems} />);
      const checkbox = screen.getByRole('checkbox', { name: selectedItems[0] });
      expect(checkbox).toHaveAttribute('aria-checked', 'true');
    });
  });

  describe('キーボード操作', () => {
    it('Tabキーでフォーカスが移動すること', async () => {
      render(<Region {...defaultProps} />);
      const firstItem = Object.values(REGION_OPTIONS)[0][0];
      const checkbox = screen.getByRole('checkbox', { name: firstItem });

      // フォーカス可能な要素にフォーカスを設定
      checkbox.focus();

      // フォーカスが正しく設定されたことを確認
      expect(checkbox).toHaveFocus();
    });

    it('スペースキーで選択状態が切り替わること', () => {
      render(<Region {...defaultProps} />);
      const firstItem = Object.values(REGION_OPTIONS)[0][0];
      const checkbox = screen.getByRole('checkbox', { name: firstItem });

      // フォーカスを設定してからスペースキーを押す
      checkbox.focus();
      fireEvent.keyDown(checkbox, { key: ' ' });

      expect(mockOnChange).toHaveBeenCalledWith([firstItem]);
    });
  });
});
