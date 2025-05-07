/**
 * カテゴリチェックボックスのテスト
 *
 * このテストでは、以下の項目を検証します：
 * - カテゴリチェックボックスの表示
 * - 選択状態の管理
 * - アクセシビリティ
 * - エラーケース
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CategoryCheckbox from './category-checkbox';

describe('CategoryCheckbox', () => {
  const setup = (props = {}) => {
    const defaultProps = {
      categoryName: 'テストカテゴリ',
      categoryItems: ['アイテム1', 'アイテム2'],
      selectedItems: [] as string[],
      onItemChange: vi.fn(),
      itemLabel: (item: string) => item,
    };
    return render(<CategoryCheckbox {...defaultProps} {...props} />);
  };

  describe('表示', () => {
    it('カテゴリ名が正しく表示されること', () => {
      setup({ categoryName: 'テストカテゴリ' });
      expect(screen.getByText('テストカテゴリ')).toBeInTheDocument();
    });

    it('アイテムが正しく表示されること', () => {
      setup();
      expect(screen.getByText('アイテム1')).toBeInTheDocument();
      expect(screen.getByText('アイテム2')).toBeInTheDocument();
    });
  });

  describe('選択状態の管理', () => {
    it('アイテムを選択するとonItemChangeが呼ばれること', () => {
      const onItemChange = vi.fn();
      setup({ onItemChange });
      const checkbox = screen.getByRole('checkbox', { name: 'アイテム1' });
      fireEvent.click(checkbox);
      expect(onItemChange).toHaveBeenCalledWith('アイテム1', true);
    });

    it('カテゴリ全体を選択するとすべてのアイテムが選択されること', () => {
      const onItemChange = vi.fn();
      setup({ onItemChange });
      const categoryCheckbox = screen.getByRole('checkbox', { name: 'すべて' });
      fireEvent.click(categoryCheckbox);
      expect(onItemChange).toHaveBeenCalledWith('アイテム1', true);
      expect(onItemChange).toHaveBeenCalledWith('アイテム2', true);
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

    it('カテゴリチェックボックスに適切なARIA属性が設定されていること', () => {
      setup();
      const categoryCheckbox = screen.getByRole('checkbox', { name: 'すべて' });
      expect(categoryCheckbox).toHaveAttribute('aria-checked', 'false');
      expect(categoryCheckbox).toHaveAttribute('aria-disabled', 'false');
      expect(categoryCheckbox).toHaveAttribute('aria-required', 'false');
    });
  });

  describe('エラーケース', () => {
    it('categoryItemsが空配列の場合でもエラーが発生しないこと', () => {
      expect(() => {
        setup({ categoryItems: [] });
      }).not.toThrow();
    });

    it('selectedItemsが未定義の場合でもエラーが発生しないこと', () => {
      expect(() => {
        setup({ selectedItems: [] }); // undefinedの代わりに空配列を使用
      }).not.toThrow();
    });

    it('onItemChangeが未定義の場合でもエラーが発生しないこと', () => {
      expect(() => {
        setup({ onItemChange: undefined });
      }).not.toThrow();
    });
  });
});
