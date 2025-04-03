/**
 * シンプルチェックボックスグループコンポーネント
 *
 * このコンポーネントは、シンプルなチェックボックスグループを提供します。
 * 文字列の配列をチェックボックスアイテムとして表示し、選択状態を管理します。
 */
import React from 'react';
import BaseCheckboxGroup from './base-checkbox-group';
import { checkboxStyles } from './checkbox-styles';
import {
  BaseCheckboxGroupProps,
  DEFAULT_GET_ITEM_KEY,
  renderCheckboxItems,
} from './checkbox-utils';

/**
 * SimpleCheckboxGroupコンポーネントのプロパティ
 */
interface SimpleCheckboxGroupProps extends BaseCheckboxGroupProps<string> {
  /** チェックボックスアイテムの配列 */
  items: string[];
}

/**
 * シンプルチェックボックスグループコンポーネント
 *
 * @param items - チェックボックスアイテムの配列
 * @param selectedItems - 現在選択されているアイテムの配列
 * @param setSelectedItems - 選択されたアイテムを更新する関数
 * @param label - チェックボックスグループのラベル
 * @param getItemKey - アイテムのキーを取得する関数
 */
const SimpleCheckboxGroup: React.FC<SimpleCheckboxGroupProps> = ({
  items,
  selectedItems,
  setSelectedItems,
  label,
  getItemKey = DEFAULT_GET_ITEM_KEY,
}) => {
  return (
    <BaseCheckboxGroup
      items={items}
      selectedItems={selectedItems}
      setSelectedItems={setSelectedItems}
      label={label}
      getItemKey={getItemKey}
      renderItems={({ items, selectedItems, handleItemChange }) =>
        renderCheckboxItems(items, selectedItems, handleItemChange, getItemKey)
      }
      className={checkboxStyles.categoryItemsContainer}
    />
  );
};

export default SimpleCheckboxGroup;
