/**
 * 「すべて」のチェックボックスを制御するコンポーネント
 *
 * このコンポーネントは、グループ内のすべてのチェックボックスを一括で選択/解除するための
 * 親チェックボックスを提供します。中間状態（一部選択）もサポートしています。
 */
import BaseCheckbox from './base-checkbox';

/**
 * AllCheckboxコンポーネントのプロパティ
 */
interface AllCheckboxProps {
  /** すべてのアイテムが選択されているかどうか */
  allChecked: boolean;
  /** 一部のアイテムのみが選択されているかどうか（中間状態） */
  indeterminate: boolean;
  /** チェックボックスの状態が変更されたときに呼び出される関数 */
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** チェックボックスのラベル */
  label: string;
  /** チェックボックスのID */
  id?: string;
  /** タブインデックス */
  tabIndex?: number;
}

/**
 * すべてのチェックボックスを制御するコンポーネント
 *
 * @param allChecked - すべてのアイテムが選択されているかどうか
 * @param indeterminate - 一部のアイテムのみが選択されているかどうか
 * @param onChange - チェックボックスの状態が変更されたときに呼び出される関数
 * @param label - チェックボックスのラベル
 * @param id - チェックボックスのID
 * @param tabIndex - タブインデックス
 */
const AllCheckbox = ({
  allChecked,
  indeterminate,
  onChange,
  label,
  id,
  tabIndex,
}: AllCheckboxProps) => {
  return (
    <BaseCheckbox
      checked={allChecked}
      indeterminate={indeterminate}
      onChange={onChange}
      label={label}
      id={id}
      tabIndex={tabIndex}
    />
  );
};

export default AllCheckbox;
