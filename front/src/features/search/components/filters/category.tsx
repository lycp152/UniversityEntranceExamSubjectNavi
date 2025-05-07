/**
 * カテゴリー型のチェックボックスフィルターの共通コンポーネント
 */

import CategoryCheckboxGroup from '../../components/checkbox/category-checkbox-group';
import { FilterCheckboxProps } from '../../types/filter';

/**
 * カテゴリーフィルターのプロパティ
 *
 * @interface CategoryFilterProps
 * @extends {FilterCheckboxProps}
 * @property {Record<string, string[]>} categories - カテゴリーとその選択肢のマップ
 * @property {string} label - フィルターのラベル
 */
interface CategoryFilterProps extends FilterCheckboxProps {
  /** カテゴリーとその選択肢のマップ */
  categories: Record<string, string[]>;
  /** フィルターのラベル */
  label: string;
}

/**
 * カテゴリーフィルターコンポーネント
 *
 * カテゴリーとその選択肢を階層的に表示し、複数選択可能なフィルターコンポーネントです。
 * 大学の学部や学科など、階層構造を持つデータのフィルタリングに使用します。
 *
 * @component
 * @example
 * ```tsx
 * <CategoryFilter
 *   categories={{
 *     "理系": ["理学部", "工学部"],
 *     "文系": ["文学部", "経済学部"]
 *   }}
 *   selectedItems={["理学部"]}
 *   setSelectedItems={setSelectedItems}
 *   label="学部"
 * />
 * ```
 *
 * @param {CategoryFilterProps} props - コンポーネントのプロパティ
 * @returns {JSX.Element} カテゴリーフィルターコンポーネント
 */
export const CategoryFilter = ({
  categories,
  selectedItems,
  setSelectedItems,
  label,
}: CategoryFilterProps) => (
  <CategoryCheckboxGroup
    categories={categories}
    selectedItems={selectedItems}
    setSelectedItems={setSelectedItems}
    label={label}
    itemLabel={item => item}
  />
);
