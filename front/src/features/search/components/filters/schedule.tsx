import { Filter } from './filter';
import { SCHEDULE_OPTIONS, FILTER_LABELS } from '../../constants/filter-options';
import { FilterCheckboxProps } from '../../types/filter';

const config = {
  type: 'schedule' as const,
  label: FILTER_LABELS.SCHEDULE,
  options: SCHEDULE_OPTIONS,
  isCategory: false,
};

/**
 * 日程フィルターコンポーネント
 *
 * @component
 * @param {FilterCheckboxProps} props - フィルターコンポーネントのプロパティ
 * @param {string[]} props.selectedValues - 選択された日程の値の配列
 * @param {(values: string[]) => void} props.onChange - 選択値が変更されたときに呼び出されるコールバック関数
 * @returns {JSX.Element} 日程フィルターコンポーネント
 *
 * @example
 * ```tsx
 * <Schedule
 *   selectedValues={['前期', '中期']}
 *   onChange={(values) => console.log(values)}
 * />
 * ```
 */
export const Schedule: React.FC<FilterCheckboxProps> = props => (
  <Filter config={config} {...props} />
);
