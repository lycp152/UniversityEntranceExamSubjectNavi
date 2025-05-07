import { GenericFilter } from './generic';
import { ACADEMIC_FIELD_OPTIONS, FILTER_LABELS } from '../../constants/filter-options';
import { FilterCheckboxProps } from '../../types/filter';

/**
 * 学問系統フィルターコンポーネント
 *
 * @component
 * @param {FilterCheckboxProps} props - フィルターコンポーネントのプロパティ
 * @param {string[]} props.selectedValues - 選択された学問系統の値の配列
 * @param {(values: string[]) => void} props.onChange - 選択値が変更されたときに呼び出されるコールバック関数
 * @returns {JSX.Element} 学問系統フィルターコンポーネント
 *
 * @example
 * ```tsx
 * <AcademicField
 *   selectedValues={['人文科学', '社会科学']}
 *   onChange={(values) => console.log(values)}
 * />
 * ```
 */
export const AcademicField = (props: FilterCheckboxProps) => (
  <GenericFilter items={ACADEMIC_FIELD_OPTIONS} label={FILTER_LABELS.ACADEMIC_FIELD} {...props} />
);
