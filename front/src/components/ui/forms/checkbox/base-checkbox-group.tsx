/**
 * チェックボックスグループの基本コンポーネント
 *
 * このコンポーネントは、チェックボックスグループの基本構造を提供します。
 * 選択状態の管理、全選択/解除機能、およびカスタムレンダリングをサポートします。
 */
import React from 'react';
import { useCheckboxGroup } from './use-checkbox-group';
import CheckboxGroupLayout from './checkbox-group-layout';
import { BaseCheckboxGroupProps, createCheckboxChangeHandler } from './checkbox-utils';

/**
 * BaseCheckboxGroupコンポーネントのプロパティ
 *
 * @template T - チェックボックスアイテムの型
 */
interface BaseCheckboxGroupComponentProps<T> extends BaseCheckboxGroupProps<T> {
  /** チェックボックスグループに表示するアイテムの配列 */
  items: T[];
  /** アイテムをレンダリングするための関数 */
  renderItems: (props: {
    items: T[];
    selectedItems: T[];
    handleItemChange: (item: T, checked: boolean) => void;
  }) => React.ReactNode;
  /** コンテナに適用する追加のCSSクラス */
  className?: string;
}

/**
 * チェックボックスグループの基本コンポーネント
 *
 * @template T - チェックボックスアイテムの型
 * @param items - チェックボックスグループに表示するアイテムの配列
 * @param selectedItems - 現在選択されているアイテムの配列
 * @param setSelectedItems - 選択されたアイテムを更新する関数
 * @param label - チェックボックスグループのラベル
 * @param renderItems - アイテムをレンダリングするための関数
 * @param className - コンテナに適用する追加のCSSクラス
 */
export const BaseCheckboxGroup = <T,>({
  items,
  selectedItems,
  setSelectedItems,
  label,
  renderItems,
  className,
}: BaseCheckboxGroupComponentProps<T>) => {
  const { allChecked, isIndeterminate, handleItemChange, handleSelectAll } = useCheckboxGroup<T>({
    items,
    initialSelected: selectedItems,
    onSelectionChange: setSelectedItems,
  });

  const handleAllChange = createCheckboxChangeHandler(handleSelectAll);

  return (
    <CheckboxGroupLayout
      label={label}
      allChecked={allChecked}
      isIndeterminate={isIndeterminate}
      onAllChange={handleAllChange}
      className={className}
    >
      {renderItems({
        items,
        selectedItems,
        handleItemChange,
      })}
    </CheckboxGroupLayout>
  );
};

export default BaseCheckboxGroup;
