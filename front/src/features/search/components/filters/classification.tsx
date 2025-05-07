import { CategoryFilter } from './category';
import { CLASSIFICATION_OPTIONS, FILTER_LABELS } from '../../constants/filter-options';
import { FilterCheckboxProps } from '../../types/filter';

/**
 * 設置区分フィルターコンポーネント
 *
 * @component
 * @param {FilterCheckboxProps} props - フィルターコンポーネントのプロパティ
 * @param {string[]} props.selectedValues - 選択された設置区分の値の配列
 * @param {(values: string[]) => void} props.onChange - 選択値が変更されたときに呼び出されるコールバック関数
 * @returns {JSX.Element} 設置区分フィルターコンポーネント
 *
 * @example
 * ```tsx
 * <Classification
 *   selectedValues={['国立', '公立']}
 *   onChange={(values) => console.log(values)}
 * />
 * ```
 */
export const Classification = (props: FilterCheckboxProps) => (
  <CategoryFilter
    categories={CLASSIFICATION_OPTIONS}
    label={FILTER_LABELS.CLASSIFICATION}
    {...props}
  />
);
