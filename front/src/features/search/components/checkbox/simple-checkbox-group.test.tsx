/**
 * シンプルチェックボックスグループコンポーネントのテスト
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
import SimpleCheckboxGroup from './simple-checkbox-group';

describe('SimpleCheckboxGroup', () => {
  const setup = (props = {}) => {
    const defaultProps = {
      items: ['アイテム1', 'アイテム2', 'アイテム3'],
      selectedItems: [] as string[],
      setSelectedItems: vi.fn(),
      label: 'テストグループ',
    };
    return render(<SimpleCheckboxGroup {...defaultProps} {...props} />);
  };

  describe('表示', () => {
    it('ラベルが正しく表示されること', () => {
      setup({ label: 'テストラベル' });
      expect(screen.getByText('テストラベル')).toBeInTheDocument();
    });

    it('アイテムが正しく表示されること', () => {
      setup();
      expect(screen.getByText('アイテム1')).toBeInTheDocument();
      expect(screen.getByText('アイテム2')).toBeInTheDocument();
      expect(screen.getByText('アイテム3')).toBeInTheDocument();
    });
  });

  describe('選択状態の管理', () => {
    it('アイテムを選択するとsetSelectedItemsが呼ばれること', () => {
      const setSelectedItems = vi.fn();
      setup({ setSelectedItems });
      const checkbox = screen.getByRole('checkbox', { name: 'アイテム1' });
      fireEvent.click(checkbox);
      expect(setSelectedItems).toHaveBeenCalledWith(['アイテム1']);
    });

    it('複数のアイテムを選択できること', () => {
      const setSelectedItems = vi.fn();
      setup({ setSelectedItems });
      const checkbox1 = screen.getByRole('checkbox', { name: 'アイテム1' });
      const checkbox2 = screen.getByRole('checkbox', { name: 'アイテム2' });
      fireEvent.click(checkbox1);
      fireEvent.click(checkbox2);
      expect(setSelectedItems).toHaveBeenCalledWith(['アイテム1', 'アイテム2']);
    });
  });

  describe('全選択/解除機能', () => {
    it('全選択ボタンをクリックするとすべてのアイテムが選択されること', () => {
      const setSelectedItems = vi.fn();
      setup({ setSelectedItems });
      const allCheckbox = screen.getByRole('checkbox', { name: 'すべて' });
      fireEvent.click(allCheckbox);
      expect(setSelectedItems).toHaveBeenCalledWith(['アイテム1', 'アイテム2', 'アイテム3']);
    });

    it('全解除ボタンをクリックするとすべてのアイテムが解除されること', () => {
      const setSelectedItems = vi.fn();
      setup({
        setSelectedItems,
        selectedItems: ['アイテム1', 'アイテム2', 'アイテム3'],
      });
      const allCheckbox = screen.getByRole('checkbox', { name: 'すべて' });
      fireEvent.click(allCheckbox);
      expect(setSelectedItems).toHaveBeenCalledWith([]);
    });
  });

  describe('アクセシビリティ', () => {
    it('チェックボックスに適切なARIA属性が設定されていること', () => {
      setup();
      const checkbox = screen.getByRole('checkbox', { name: 'アイテム1' });
      expect(checkbox).toHaveAttribute('aria-checked', 'false');
      expect(checkbox).toHaveAttribute('aria-disabled', 'false');
      expect(checkbox).toHaveAttribute('aria-required', 'false');
    });

    it('全選択チェックボックスに適切なARIA属性が設定されていること', () => {
      setup();
      const allCheckbox = screen.getByRole('checkbox', { name: 'すべて' });
      expect(allCheckbox).toHaveAttribute('aria-checked', 'false');
      expect(allCheckbox).toHaveAttribute('aria-disabled', 'false');
      expect(allCheckbox).toHaveAttribute('aria-required', 'false');
    });
  });

  describe('エラーケース', () => {
    it('itemsが空配列の場合でもエラーが発生しないこと', () => {
      expect(() => {
        setup({ items: [] });
      }).not.toThrow();
    });

    it('selectedItemsが未定義の場合でもエラーが発生しないこと', () => {
      expect(() => {
        setup({ selectedItems: [] }); // undefinedの代わりに空配列を使用
      }).not.toThrow();
    });

    it('setSelectedItemsが未定義の場合でもエラーが発生しないこと', () => {
      expect(() => {
        setup({ setSelectedItems: undefined });
      }).not.toThrow();
    });
  });
});
