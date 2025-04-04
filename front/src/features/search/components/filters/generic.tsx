/**
 * 一般的なチェックボックスフィルターの共通コンポーネント
 */

import GenericCheckboxGroup from '@/components/ui/forms/checkbox/simple-checkbox-group';
import { FilterCheckboxProps } from '../../types/filter';

/**
 * 汎用フィルターのプロパティ
 *
 * @interface GenericFilterProps
 * @extends {FilterCheckboxProps}
 * @property {string[]} items - 選択肢の配列
 * @property {string} label - フィルターのラベル
 */
interface GenericFilterProps extends FilterCheckboxProps {
  /** 選択肢の配列 */
  items: string[];
  /** フィルターのラベル */
  label: string;
}

/**
 * 汎用フィルターコンポーネント
 *
 * 単一レベルの選択肢を表示し、複数選択可能なフィルターコンポーネントです。
 * 大学の所在地や入試方式など、単一レベルのデータのフィルタリングに使用します。
 *
 * @component
 * @example
 * ```tsx
 * <GenericFilter
 *   items={["東京", "大阪", "名古屋"]}
 *   selectedItems={["東京"]}
 *   setSelectedItems={setSelectedItems}
 *   label="所在地"
 * />
 * ```
 *
 * @param {GenericFilterProps} props - コンポーネントのプロパティ
 * @returns {JSX.Element} 汎用フィルターコンポーネント
 */
export const GenericFilter: React.FC<GenericFilterProps> = ({
  items,
  selectedItems,
  setSelectedItems,
  label,
}) => (
  <GenericCheckboxGroup
    items={items}
    selectedItems={selectedItems}
    setSelectedItems={setSelectedItems}
    label={label}
  />
);
