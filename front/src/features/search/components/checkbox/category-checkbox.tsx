/**
 * カテゴリチェックボックスコンポーネント
 *
 * このコンポーネントは、カテゴリ内のアイテムをグループ化して表示します。
 * カテゴリ全体の選択/解除と、個別のアイテムの選択/解除をサポートします。
 */
import CheckboxGroupLayout from './checkbox-group-layout';
import {
  calculateCheckboxState,
  createCheckboxChangeHandler,
  DEFAULT_GET_ITEM_KEY,
  renderCheckboxItems,
} from './checkbox-utils';

/**
 * CategoryCheckboxコンポーネントのプロパティ
 *
 * @template T - チェックボックスアイテムの型
 */
interface CategoryCheckboxProps<T> {
  /** カテゴリ名 */
  categoryName: string;
  /** カテゴリに属するアイテムの配列 */
  categoryItems: T[];
  /** 現在選択されているアイテムの配列 */
  selectedItems: T[];
  /** アイテムの選択状態が変更されたときに呼び出される関数 */
  onItemChange: (item: T, checked: boolean) => void;
  /** アイテムのラベルを取得する関数 */
  itemLabel: (item: T) => string;
  /** アイテムのキーを取得する関数 */
  getItemKey?: (item: T) => string;
}

/**
 * カテゴリチェックボックスコンポーネント
 *
 * @template T - チェックボックスアイテムの型
 * @param categoryName - カテゴリ名
 * @param categoryItems - カテゴリに属するアイテムの配列
 * @param selectedItems - 現在選択されているアイテムの配列
 * @param onItemChange - アイテムの選択状態が変更されたときに呼び出される関数
 * @param itemLabel - アイテムのラベルを取得する関数
 * @param getItemKey - アイテムのキーを取得する関数
 */
const CategoryCheckbox = <T,>({
  categoryName,
  categoryItems,
  selectedItems,
  onItemChange,
  itemLabel,
  getItemKey = DEFAULT_GET_ITEM_KEY,
}: CategoryCheckboxProps<T>) => {
  const { allChecked, isIndeterminate } = calculateCheckboxState(
    categoryItems,
    selectedItems,
    getItemKey
  );

  const handleCategoryChange = (checked: boolean) => {
    categoryItems.forEach(item => onItemChange(item, checked));
  };

  return (
    <CheckboxGroupLayout
      label={categoryName}
      allChecked={allChecked}
      isIndeterminate={isIndeterminate}
      onAllChange={createCheckboxChangeHandler(handleCategoryChange)}
      containerClassName="flex-1 min-w-[200px]"
      className="ml-4"
    >
      {renderCheckboxItems(categoryItems, selectedItems, onItemChange, getItemKey, itemLabel)}
    </CheckboxGroupLayout>
  );
};

export default CategoryCheckbox;
