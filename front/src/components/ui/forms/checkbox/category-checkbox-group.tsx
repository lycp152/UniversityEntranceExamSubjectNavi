/**
 * カテゴリチェックボックスグループコンポーネント
 *
 * このコンポーネントは、カテゴリごとにグループ化されたチェックボックスを提供します。
 * 各カテゴリは独自の選択状態を持ち、カテゴリ内のアイテムを一括で選択/解除できます。
 */
import React from 'react';
import BaseCheckboxGroup from './base-checkbox-group';
import CategoryCheckbox from './category-checkbox';
import { BaseCheckboxGroupProps } from './checkbox-utils';

/**
 * CategoryCheckboxGroupコンポーネントのプロパティ
 *
 * @template T - チェックボックスアイテムの型
 */
interface CategoryCheckboxGroupProps<T> extends BaseCheckboxGroupProps<T> {
  /** カテゴリごとにグループ化されたアイテム */
  categories: Record<string, T[]>;
  /** アイテムのラベルを取得する関数 */
  itemLabel: (item: T) => string;
}

/**
 * カテゴリチェックボックスグループコンポーネント
 *
 * @template T - チェックボックスアイテムの型
 * @param categories - カテゴリごとにグループ化されたアイテム
 * @param selectedItems - 現在選択されているアイテムの配列
 * @param setSelectedItems - 選択されたアイテムを更新する関数
 * @param label - チェックボックスグループのラベル
 * @param itemLabel - アイテムのラベルを取得する関数
 */
const CategoryCheckboxGroup = <T,>({
  categories,
  selectedItems,
  setSelectedItems,
  label,
  itemLabel,
}: CategoryCheckboxGroupProps<T>) => {
  const allItems = Object.values(categories).flat();

  return (
    <BaseCheckboxGroup
      items={allItems}
      selectedItems={selectedItems}
      setSelectedItems={setSelectedItems}
      label={label}
      renderItems={({ selectedItems, handleItemChange }) => (
        <>
          {Object.entries(categories).map(([categoryName, categoryItems]) => (
            <CategoryCheckbox
              key={categoryName}
              categoryName={categoryName}
              categoryItems={categoryItems}
              selectedItems={selectedItems}
              onItemChange={handleItemChange}
              itemLabel={itemLabel}
            />
          ))}
        </>
      )}
    />
  );
};

export default CategoryCheckboxGroup;
