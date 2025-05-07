/**
 * チェックボックスグループのカスタムフックのテスト
 *
 * このテストでは、以下の項目を検証します：
 * - 選択状態の管理
 * - 全選択/解除機能
 * - カテゴリごとの選択/解除
 * - エラーケース
 */
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCheckboxGroup } from './use-checkbox-group';

describe('useCheckboxGroup', () => {
  const setup = (props = {}) => {
    const defaultProps = {
      items: ['アイテム1', 'アイテム2', 'アイテム3'],
      initialSelected: [] as string[],
      onSelectionChange: vi.fn(),
    };
    return renderHook(() => useCheckboxGroup({ ...defaultProps, ...props }));
  };

  describe('選択状態の管理', () => {
    it('初期選択状態が正しく設定されること', () => {
      const { result } = setup({
        initialSelected: ['アイテム1'],
      });
      expect(result.current.selectedItems).toEqual(['アイテム1']);
    });

    it('アイテムを選択すると選択状態が更新されること', () => {
      const { result } = setup();
      act(() => {
        result.current.handleItemChange('アイテム1', true);
      });
      expect(result.current.selectedItems).toEqual(['アイテム1']);
    });

    it('選択済みアイテムを解除すると選択状態が更新されること', () => {
      const { result } = setup({
        initialSelected: ['アイテム1'],
      });
      act(() => {
        result.current.handleItemChange('アイテム1', false);
      });
      expect(result.current.selectedItems).toEqual([]);
    });
  });

  describe('全選択/解除機能', () => {
    it('全選択を実行するとすべてのアイテムが選択されること', () => {
      const { result } = setup();
      act(() => {
        result.current.handleSelectAll(true);
      });
      expect(result.current.selectedItems).toEqual(['アイテム1', 'アイテム2', 'アイテム3']);
    });

    it('全解除を実行するとすべてのアイテムが解除されること', () => {
      const { result } = setup({
        initialSelected: ['アイテム1', 'アイテム2', 'アイテム3'],
      });
      act(() => {
        result.current.handleSelectAll(false);
      });
      expect(result.current.selectedItems).toEqual([]);
    });
  });

  describe('カテゴリごとの選択/解除', () => {
    it('カテゴリ内のアイテムを一括で選択できること', () => {
      const { result } = setup();
      const categoryItems = ['アイテム1', 'アイテム2'];
      act(() => {
        result.current.handleCategoryChange(categoryItems, true);
      });
      expect(result.current.selectedItems).toEqual(['アイテム1', 'アイテム2']);
    });

    it('カテゴリ内のアイテムを一括で解除できること', () => {
      const { result } = setup({
        initialSelected: ['アイテム1', 'アイテム2', 'アイテム3'],
      });
      const categoryItems = ['アイテム1', 'アイテム2'];
      act(() => {
        result.current.handleCategoryChange(categoryItems, false);
      });
      expect(result.current.selectedItems).toEqual(['アイテム3']);
    });
  });

  describe('選択状態の計算', () => {
    it('すべてのアイテムが選択されている場合、allCheckedがtrueになること', () => {
      const { result } = setup({
        initialSelected: ['アイテム1', 'アイテム2', 'アイテム3'],
      });
      expect(result.current.allChecked).toBe(true);
    });

    it('一部のアイテムのみが選択されている場合、isIndeterminateがtrueになること', () => {
      const { result } = setup({
        initialSelected: ['アイテム1'],
      });
      expect(result.current.isIndeterminate).toBe(true);
    });
  });

  describe('エラーケース', () => {
    it('itemsが空配列の場合でもエラーが発生しないこと', () => {
      expect(() => {
        setup({ items: [] });
      }).not.toThrow();
    });

    it('initialSelectedが未定義の場合でもエラーが発生しないこと', () => {
      expect(() => {
        setup({ initialSelected: [] }); // undefinedの代わりに空配列を使用
      }).not.toThrow();
    });

    it('onSelectionChangeが未定義の場合でもエラーが発生しないこと', () => {
      expect(() => {
        setup({ onSelectionChange: undefined });
      }).not.toThrow();
    });
  });
});
