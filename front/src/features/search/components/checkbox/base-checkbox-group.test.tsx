/**
 * BaseCheckboxGroupコンポーネントのテスト
 *
 * このテストでは、以下の項目を検証します：
 * - チェックボックスグループの表示
 * - 選択状態の管理
 * - 全選択/解除機能
 * - アクセシビリティ
 * - エラーケース
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import BaseCheckboxGroup from './base-checkbox-group';

const renderTestItems = ({
  items,
  selectedItems,
  handleItemChange,
}: {
  items: string[];
  selectedItems: string[];
  handleItemChange: (item: string, checked: boolean) => void;
}) => (
  <div>
    {items.map((item: string) => (
      <div key={item}>
        <input
          type="checkbox"
          checked={selectedItems.includes(item)}
          onChange={() => handleItemChange(item, !selectedItems.includes(item))}
          aria-label={item}
        />
        <span>{item}</span>
      </div>
    ))}
  </div>
);

describe('BaseCheckboxGroup', () => {
  const setup = (props = {}) => {
    const defaultProps = {
      items: ['item1', 'item2', 'item3'] as string[],
      selectedItems: [] as string[],
      setSelectedItems: vi.fn(),
      label: 'テストグループ',
      renderItems: renderTestItems,
    };
    return render(<BaseCheckboxGroup {...defaultProps} {...props} />);
  };

  describe('表示', () => {
    it('ラベルが正しく表示されること', () => {
      setup({ label: 'テストラベル' });
      expect(screen.getByText('テストラベル')).toBeInTheDocument();
    });

    it('アイテムが正しく表示されること', () => {
      setup();
      expect(screen.getByText('item1')).toBeInTheDocument();
      expect(screen.getByText('item2')).toBeInTheDocument();
      expect(screen.getByText('item3')).toBeInTheDocument();
    });
  });

  describe('選択状態の管理', () => {
    it('アイテムを選択するとsetSelectedItemsが呼ばれること', () => {
      const setSelectedItems = vi.fn();
      setup({ setSelectedItems });
      const checkbox = screen.getByLabelText('item1');
      fireEvent.click(checkbox);
      expect(setSelectedItems).toHaveBeenCalledWith(['item1']);
    });

    it('複数のアイテムを選択できること', () => {
      const setSelectedItems = vi.fn();
      setup({ setSelectedItems });
      const checkbox1 = screen.getByLabelText('item1');
      const checkbox2 = screen.getByLabelText('item2');
      fireEvent.click(checkbox1);
      fireEvent.click(checkbox2);
      expect(setSelectedItems).toHaveBeenCalledWith(['item1', 'item2']);
    });
  });

  describe('全選択/解除機能', () => {
    it('全選択ボタンをクリックするとすべてのアイテムが選択されること', () => {
      const setSelectedItems = vi.fn();
      setup({ setSelectedItems });
      const allCheckbox = screen.getByLabelText('すべて');
      fireEvent.click(allCheckbox);
      expect(setSelectedItems).toHaveBeenCalledWith(['item1', 'item2', 'item3']);
    });

    it('全解除ボタンをクリックするとすべてのアイテムが解除されること', () => {
      const setSelectedItems = vi.fn();
      setup({
        setSelectedItems,
        selectedItems: ['item1', 'item2', 'item3'],
      });
      const allCheckbox = screen.getByLabelText('すべて');
      fireEvent.click(allCheckbox);
      expect(setSelectedItems).toHaveBeenCalledWith([]);
    });
  });

  describe('アクセシビリティ', () => {
    it('チェックボックスに適切なaria属性が設定されていること', () => {
      setup();
      const checkbox = screen.getByLabelText('item1');
      expect(checkbox).toHaveAttribute('type', 'checkbox');
      expect(checkbox).toHaveAttribute('aria-label', 'item1');
    });

    it('全選択チェックボックスに適切なaria属性が設定されていること', () => {
      setup();
      const allCheckbox = screen.getByLabelText('すべて');
      expect(allCheckbox).toHaveAttribute('aria-label', 'すべて');
      expect(allCheckbox).toHaveAttribute('aria-checked', 'false');
    });
  });

  describe('エラーケース', () => {
    it('itemsが空配列の場合でもエラーが発生しないこと', () => {
      expect(() => {
        setup({ items: [] });
      }).not.toThrow();
    });

    it('setSelectedItemsが未定義の場合でもエラーが発生しないこと', () => {
      expect(() => {
        setup({ setSelectedItems: undefined });
      }).not.toThrow();
    });
  });
});
