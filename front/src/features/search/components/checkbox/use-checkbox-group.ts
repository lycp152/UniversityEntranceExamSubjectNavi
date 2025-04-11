/**
 * チェックボックスグループのカスタムフック
 *
 * このフックは、チェックボックスグループの状態管理とイベントハンドラを提供します。
 * 選択状態の管理、全選択/解除機能、およびカテゴリごとの選択/解除機能をサポートします。
 */
import { useState, useEffect, useMemo } from 'react';
import { calculateCheckboxState, DEFAULT_GET_ITEM_KEY } from './checkbox-utils';

/**
 * useCheckboxGroupフックのプロパティ
 *
 * @template T - チェックボックスアイテムの型
 */
interface UseCheckboxGroupProps<T> {
  /** チェックボックスアイテムの配列 */
  items: T[];
  /** 初期選択状態のアイテム配列 */
  initialSelected: T[];
  /** 選択状態が変更されたときに呼び出される関数 */
  onSelectionChange?: (selected: T[]) => void;
  /** アイテムのキーを取得する関数 */
  getItemKey?: (item: T) => string;
}

/**
 * チェックボックスグループのカスタムフック
 *
 * @template T - チェックボックスアイテムの型
 * @param items - チェックボックスアイテムの配列
 * @param initialSelected - 初期選択状態のアイテム配列
 * @param onSelectionChange - 選択状態が変更されたときに呼び出される関数
 * @param getItemKey - アイテムのキーを取得する関数
 * @returns チェックボックスグループの状態とハンドラ
 */
export const useCheckboxGroup = <T>({
  items,
  initialSelected,
  onSelectionChange,
  getItemKey = DEFAULT_GET_ITEM_KEY,
}: UseCheckboxGroupProps<T>) => {
  const [selectedItems, setSelectedItems] = useState<T[]>(initialSelected);

  const { allChecked, isIndeterminate } = useMemo(
    () => calculateCheckboxState(items, selectedItems, getItemKey),
    [items, selectedItems, getItemKey]
  );

  useEffect(() => {
    onSelectionChange?.(selectedItems);
  }, [selectedItems, onSelectionChange]);

  /**
   * アイテムの選択状態を変更するハンドラ
   *
   * @param item - チェックボックスアイテム
   * @param checked - チェックボックスの選択状態
   */
  const handleItemChange = (item: T, checked: boolean) => {
    setSelectedItems(prev =>
      checked
        ? [...prev, item]
        : prev.filter(selectedItem => getItemKey(selectedItem) !== getItemKey(item))
    );
  };

  /**
   * すべてのアイテムを選択/解除するハンドラ
   *
   * @param checked - チェックボックスの選択状態
   */
  const handleSelectAll = (checked: boolean) => {
    setSelectedItems(checked ? items : []);
  };

  /**
   * カテゴリ内のアイテムが選択されているかどうかをチェックする関数
   *
   * @param item - チェックボックスアイテム
   * @param categoryItems - カテゴリに属するアイテムの配列
   * @returns アイテムがカテゴリ内に存在するかどうか
   */
  const isItemInCategory = (item: T, categoryItems: T[]): boolean => {
    return categoryItems.some(categoryItem => getItemKey(categoryItem) === getItemKey(item));
  };

  /**
   * カテゴリ内のアイテムを一括で選択/解除するハンドラ
   *
   * @param categoryItems - カテゴリに属するアイテムの配列
   * @param checked - チェックボックスの選択状態
   */
  const handleCategoryChange = (categoryItems: T[], checked: boolean) => {
    setSelectedItems(prev =>
      checked
        ? [...new Set([...prev, ...categoryItems])]
        : prev.filter(item => !isItemInCategory(item, categoryItems))
    );
  };

  return {
    selectedItems,
    allChecked,
    isIndeterminate,
    handleItemChange,
    handleSelectAll,
    handleCategoryChange,
  };
};
