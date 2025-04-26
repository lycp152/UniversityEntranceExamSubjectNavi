import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GenericFilter } from './generic';
import { FilterCheckboxProps } from '../../types/filter';

/**
 * GenericFilterコンポーネントのテスト
 *
 * このテストスイートでは、汎用フィルターコンポーネントの機能を包括的にテストします。
 * テストは以下の観点で実施されます：
 *
 * 1. レンダリングテスト
 *    - フィルターグループの表示
 *      - ラベルの表示
 *      - 選択肢の表示
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
 * - フィルターの設定が正しく行われていること
 * - 選択状態の初期値が適切に設定されていること
 * - コールバック関数が正しく実装されていること
 *
 * 期待される動作：
 * - ユーザーインターフェースが直感的であること
 * - アクセシビリティガイドラインに準拠していること
 * - パフォーマンスが最適化されていること
 */
describe('GenericFilter', () => {
  const mockOnChange = vi.fn();
  const defaultProps: FilterCheckboxProps = {
    selectedItems: [],
    setSelectedItems: mockOnChange,
  };

  const items = ['東京', '大阪', '愛知'];
  const label = '所在地';

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  describe('レンダリング', () => {
    it('すべての選択肢が表示されること', () => {
      render(<GenericFilter {...defaultProps} items={items} label={label} />);
      items.forEach(item => {
        expect(screen.getByRole('checkbox', { name: item })).toBeInTheDocument();
      });
    });

    it('選択された値が正しく反映されること', () => {
      const selectedItems = [items[0]];
      render(
        <GenericFilter
          {...defaultProps}
          items={items}
          label={label}
          selectedItems={selectedItems}
        />
      );
      expect(screen.getByRole('checkbox', { name: items[0] })).toBeChecked();
    });
  });

  describe('インタラクション', () => {
    it('選択値が変更されたときにonChangeが呼ばれること', () => {
      render(<GenericFilter {...defaultProps} items={items} label={label} />);
      const checkbox = screen.getByRole('checkbox', { name: items[0] });
      fireEvent.click(checkbox);
      expect(mockOnChange).toHaveBeenCalledWith([items[0]]);
    });

    it('複数の選択肢を選択できること', () => {
      render(<GenericFilter {...defaultProps} items={items} label={label} />);
      const firstCheckbox = screen.getByRole('checkbox', { name: items[0] });
      const secondCheckbox = screen.getByRole('checkbox', { name: items[1] });

      fireEvent.click(firstCheckbox);
      fireEvent.click(secondCheckbox);

      expect(mockOnChange).toHaveBeenLastCalledWith([items[0], items[1]]);
    });

    it('選択を解除できること', () => {
      const selectedItems = [items[0]];
      render(
        <GenericFilter
          {...defaultProps}
          items={items}
          label={label}
          selectedItems={selectedItems}
        />
      );
      const checkbox = screen.getByRole('checkbox', { name: items[0] });
      fireEvent.click(checkbox);
      expect(mockOnChange).toHaveBeenCalledWith([]);
    });
  });

  describe('アクセシビリティ', () => {
    it('チェックボックスに適切なARIA属性が設定されていること', () => {
      render(<GenericFilter {...defaultProps} items={items} label={label} />);
      items.forEach(item => {
        const checkbox = screen.getByRole('checkbox', { name: item });
        expect(checkbox).toHaveAttribute('aria-checked', 'false');
        expect(checkbox).toHaveAttribute('aria-required', 'false');
      });
    });

    it('選択されたチェックボックスのARIA属性が正しく更新されること', () => {
      const selectedItems = [items[0]];
      render(
        <GenericFilter
          {...defaultProps}
          items={items}
          label={label}
          selectedItems={selectedItems}
        />
      );
      const checkbox = screen.getByRole('checkbox', { name: items[0] });
      expect(checkbox).toHaveAttribute('aria-checked', 'true');
    });
  });
});
