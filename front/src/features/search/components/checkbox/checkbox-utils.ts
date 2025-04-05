/**
 * チェックボックスユーティリティ関数
 *
 * このファイルは、チェックボックス関連のコンポーネントで使用される
 * 共通のユーティリティ関数を提供します。
 */
import React, { ReactNode } from 'react';
import CheckboxItem from './checkbox-item';

/**
 * デフォルトのアイテムキー取得関数
 *
 * @template T - チェックボックスアイテムの型
 * @param item - チェックボックスアイテム
 * @returns アイテムの文字列表現
 */
export const DEFAULT_GET_ITEM_KEY = <T>(item: T): string => String(item);

/**
 * チェックボックスの状態を計算する関数
 *
 * @template T - チェックボックスアイテムの型
 * @param items - チェックボックスアイテムの配列
 * @param selectedItems - 選択されたアイテムの配列
 * @param getItemKey - アイテムのキーを取得する関数
 * @returns チェックボックスの状態（すべて選択されているか、中間状態か）
 */
export const calculateCheckboxState = <T>(
  items: T[],
  selectedItems: T[],
  getItemKey: (item: T) => string = DEFAULT_GET_ITEM_KEY
): { allChecked: boolean; isIndeterminate: boolean } => {
  const allChecked = items.every(item =>
    selectedItems.some(selectedItem => getItemKey(selectedItem) === getItemKey(item))
  );
  const isIndeterminate =
    items.some(item =>
      selectedItems.some(selectedItem => getItemKey(selectedItem) === getItemKey(item))
    ) && !allChecked;

  return { allChecked, isIndeterminate };
};

/**
 * チェックボックスの変更イベントハンドラを作成する関数
 *
 * @param onChange - チェックボックスの変更イベントハンドラ
 * @returns チェックボックスの変更イベントハンドラ
 */
export const createCheckboxChangeHandler =
  (onChange: (checked: boolean) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.checked);
  };

/**
 * アイテムの変更イベントハンドラを作成する関数
 *
 * @template T - チェックボックスアイテムの型
 * @param onChange - アイテムの変更イベントハンドラ
 * @returns アイテムの変更イベントハンドラ
 */
export const createItemChangeHandler =
  <T>(onChange: (item: T, checked: boolean) => void) =>
  (item: T) =>
  (checked: boolean) => {
    onChange(item, checked);
  };

/**
 * アイテムが選択されているかどうかを判定する関数
 *
 * @template T - チェックボックスアイテムの型
 * @param item - チェックボックスアイテム
 * @param selectedItems - 選択されたアイテムの配列
 * @param getItemKey - アイテムのキーを取得する関数
 * @returns アイテムが選択されているかどうか
 */
export const isItemSelected = <T>(
  item: T,
  selectedItems: T[],
  getItemKey: (item: T) => string = DEFAULT_GET_ITEM_KEY
): boolean => {
  return selectedItems.some(selectedItem => getItemKey(selectedItem) === getItemKey(item));
};

/**
 * チェックボックスグループの基本プロパティ
 *
 * @template T - チェックボックスアイテムの型
 */
export interface BaseCheckboxGroupProps<T = unknown> {
  /** チェックボックスグループのラベル */
  label: string;
  /** 選択されたアイテムの配列 */
  selectedItems: T[];
  /** 選択されたアイテムを更新する関数 */
  setSelectedItems: React.Dispatch<React.SetStateAction<T[]>>;
  /** アイテムのキーを取得する関数 */
  getItemKey?: (item: T) => string;
}

/**
 * チェックボックスグループの状態
 */
export interface CheckboxGroupState {
  /** すべてのアイテムが選択されているかどうか */
  allChecked: boolean;
  /** 一部のアイテムのみが選択されているかどうか（中間状態） */
  isIndeterminate: boolean;
}

/**
 * チェックボックスグループのハンドラ
 *
 * @template T - チェックボックスアイテムの型
 */
export interface CheckboxGroupHandlers<T> {
  /** アイテムの変更イベントハンドラ */
  handleItemChange: (item: T, checked: boolean) => void;
  /** 全選択/解除イベントハンドラ */
  handleSelectAll: (checked: boolean) => void;
  /** カテゴリの変更イベントハンドラ */
  handleCategoryChange?: (categoryItems: T[], checked: boolean) => void;
}

/**
 * チェックボックスグループのレンダリングプロパティ
 *
 * @template T - チェックボックスアイテムの型
 */
export interface CheckboxGroupRenderProps<T> {
  /** チェックボックスアイテムの配列 */
  items: T[];
  /** 選択されたアイテムの配列 */
  selectedItems: T[];
  /** アイテムの変更イベントハンドラ */
  handleItemChange: (item: T, checked: boolean) => void;
}

/**
 * チェックボックスアイテムをレンダリングする関数
 *
 * @template T - チェックボックスアイテムの型
 * @param items - チェックボックスアイテムの配列
 * @param selectedItems - 選択されたアイテムの配列
 * @param handleItemChange - アイテムの変更イベントハンドラ
 * @param getItemKey - アイテムのキーを取得する関数
 * @param getItemLabel - アイテムのラベルを取得する関数
 * @returns チェックボックスアイテムの配列
 */
export const renderCheckboxItems = <T>(
  items: T[],
  selectedItems: T[],
  handleItemChange: (item: T, checked: boolean) => void,
  getItemKey: (item: T) => string = DEFAULT_GET_ITEM_KEY,
  getItemLabel: (item: T) => string = String
): ReactNode[] => {
  const handleItemChangeWrapper = createItemChangeHandler(handleItemChange);

  return items.map(item => {
    const key = getItemKey(item);
    const checked = isItemSelected(item, selectedItems, getItemKey);
    const label = getItemLabel(item);

    return React.createElement(CheckboxItem, {
      key,
      item,
      checked,
      onChange: handleItemChangeWrapper(item),
      label,
    });
  });
};
