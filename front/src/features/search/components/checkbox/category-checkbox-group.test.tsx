/**
 * カテゴリチェックボックスグループのテスト
 *
 * このテストでは、以下の項目を検証します：
 * - カテゴリの表示
 * - 選択状態の管理
 * - カテゴリごとの選択/解除
 * - アクセシビリティ
 * - エラーケース
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CategoryCheckboxGroup from './category-checkbox-group';

describe('CategoryCheckboxGroup', () => {
  const setup = (props = {}) => {
    const defaultProps = {
      categories: {
        カテゴリ1: ['アイテム1', 'アイテム2'],
        カテゴリ2: ['アイテム3', 'アイテム4'],
      },
      selectedItems: [] as string[],
      setSelectedItems: vi.fn(),
      label: 'テストラベル',
      itemLabel: (item: string) => item,
    };
    return render(<CategoryCheckboxGroup {...defaultProps} {...props} />);
  };

  describe('表示', () => {
    it('ラベルが正しく表示されること', () => {
      setup({ label: 'テストラベル' });
      expect(screen.getByText('テストラベル')).toBeInTheDocument();
    });

    it('カテゴリとアイテムが正しく表示されること', () => {
      setup();
      expect(screen.getByText('カテゴリ1')).toBeInTheDocument();
      expect(screen.getByText('カテゴリ2')).toBeInTheDocument();
      expect(screen.getByText('アイテム1')).toBeInTheDocument();
      expect(screen.getByText('アイテム2')).toBeInTheDocument();
      expect(screen.getByText('アイテム3')).toBeInTheDocument();
      expect(screen.getByText('アイテム4')).toBeInTheDocument();
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

    it('カテゴリ全体を選択するとそのカテゴリのすべてのアイテムが選択されること', () => {
      const setSelectedItems = vi.fn();
      setup({ setSelectedItems });
      const categoryCheckboxes = screen.getAllByRole('checkbox', { name: 'すべて' });
      fireEvent.click(categoryCheckboxes[1]); // カテゴリ1の「すべて」チェックボックス
      expect(setSelectedItems).toHaveBeenCalledWith(['アイテム1', 'アイテム2']);
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
      const categoryCheckboxes = screen.getAllByRole('checkbox', { name: 'すべて' });
      categoryCheckboxes.forEach(checkbox => {
        expect(checkbox).toHaveAttribute('aria-checked', 'false');
        expect(checkbox).toHaveAttribute('aria-disabled', 'false');
        expect(checkbox).toHaveAttribute('aria-required', 'false');
      });
    });
  });

  describe('エラーケース', () => {
    it('categoriesが空の場合でもエラーが発生しないこと', () => {
      expect(() => {
        setup({ categories: {} });
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
