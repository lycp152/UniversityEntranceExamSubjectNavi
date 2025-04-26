/**
 * チェックボックスユーティリティ関数のテスト
 *
 * このテストでは、以下の項目を検証します：
 * - デフォルトのアイテムキー取得関数
 * - チェックボックス状態の計算
 * - チェックボックス変更ハンドラの作成
 * - アイテム変更ハンドラの作成
 * - アイテム選択状態の判定
 */
import { describe, it, expect, vi } from 'vitest';
import {
  DEFAULT_GET_ITEM_KEY,
  calculateCheckboxState,
  createCheckboxChangeHandler,
  createItemChangeHandler,
  isItemSelected,
} from './checkbox-utils';

describe('checkbox-utils', () => {
  describe('DEFAULT_GET_ITEM_KEY', () => {
    it('文字列をそのまま返すこと', () => {
      expect(DEFAULT_GET_ITEM_KEY('test')).toBe('test');
    });

    it('数値を文字列に変換すること', () => {
      expect(DEFAULT_GET_ITEM_KEY(123)).toBe('123');
    });

    it('オブジェクトを文字列に変換すること', () => {
      expect(DEFAULT_GET_ITEM_KEY({ id: 1 })).toBe('[object Object]');
    });
  });

  describe('calculateCheckboxState', () => {
    it('すべてのアイテムが選択されている場合、allCheckedがtrueになること', () => {
      const items = ['item1', 'item2'];
      const selectedItems = ['item1', 'item2'];
      const result = calculateCheckboxState(items, selectedItems);
      expect(result.allChecked).toBe(true);
      expect(result.isIndeterminate).toBe(false);
    });

    it('一部のアイテムが選択されている場合、isIndeterminateがtrueになること', () => {
      const items = ['item1', 'item2', 'item3'];
      const selectedItems = ['item1', 'item2'];
      const result = calculateCheckboxState(items, selectedItems);
      expect(result.allChecked).toBe(false);
      expect(result.isIndeterminate).toBe(true);
    });

    it('アイテムが選択されていない場合、両方ともfalseになること', () => {
      const items = ['item1', 'item2'];
      const selectedItems: string[] = [];
      const result = calculateCheckboxState(items, selectedItems);
      expect(result.allChecked).toBe(false);
      expect(result.isIndeterminate).toBe(false);
    });
  });

  describe('createCheckboxChangeHandler', () => {
    it('チェックボックスの状態変更を正しく処理すること', () => {
      const onChange = vi.fn();
      const handler = createCheckboxChangeHandler(onChange);
      const event = { target: { checked: true } } as React.ChangeEvent<HTMLInputElement>;
      handler(event);
      expect(onChange).toHaveBeenCalledWith(true);
    });
  });

  describe('createItemChangeHandler', () => {
    it('アイテムの状態変更を正しく処理すること', () => {
      const onChange = vi.fn();
      const handler = createItemChangeHandler(onChange);
      const item = 'test-item';
      const checked = true;
      handler(item)(checked);
      expect(onChange).toHaveBeenCalledWith(item, checked);
    });
  });

  describe('isItemSelected', () => {
    it('アイテムが選択されている場合、trueを返すこと', () => {
      const item = 'item1';
      const selectedItems = ['item1', 'item2'];
      expect(isItemSelected(item, selectedItems)).toBe(true);
    });

    it('アイテムが選択されていない場合、falseを返すこと', () => {
      const item = 'item3';
      const selectedItems = ['item1', 'item2'];
      expect(isItemSelected(item, selectedItems)).toBe(false);
    });

    it('カスタムのgetItemKeyを使用できること', () => {
      const item = { id: 1 };
      const selectedItems = [{ id: 1 }];
      const getItemKey = (item: { id: number }) => String(item.id);
      expect(isItemSelected(item, selectedItems, getItemKey)).toBe(true);
    });
  });
});
