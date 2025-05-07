import { Filter } from './filter';
import { REGION_OPTIONS, FILTER_LABELS } from '../../constants/filter-options';
import { FilterCheckboxProps, FilterType } from '../../types/filter';

const config = {
  type: FilterType.REGION,
  label: FILTER_LABELS.REGION,
  options: REGION_OPTIONS,
  isCategory: true,
};

/**
 * 地域フィルターコンポーネント
 *
 * @component
 * @param {FilterCheckboxProps} props - フィルターコンポーネントのプロパティ
 * @param {string[]} props.selectedValues - 選択された地域の値の配列
 * @param {(values: string[]) => void} props.onChange - 選択値が変更されたときに呼び出されるコールバック関数
 * @returns {JSX.Element} 地域フィルターコンポーネント
 *
 * @example
 * ```tsx
 * <Region
 *   selectedValues={['北海道', '東北']}
 *   onChange={(values) => console.log(values)}
 * />
 * ```
 */
export const Region = (props: FilterCheckboxProps) => <Filter config={config} {...props} />;
