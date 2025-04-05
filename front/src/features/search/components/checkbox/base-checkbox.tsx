/**
 * チェックボックスの基本コンポーネント
 *
 * このコンポーネントは、チェックボックスの基本機能を提供します。
 * 選択状態の表示、ラベルの表示、およびクリックイベントの処理をサポートします。
 */
import { checkboxStyles } from './checkbox-styles';

/**
 * BaseCheckboxコンポーネントのプロパティ
 */
interface BaseCheckboxProps {
  /** チェックボックスの選択状態 */
  checked: boolean;
  /** チェックボックスの変更イベントハンドラ */
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** チェックボックスのラベルテキスト */
  label: string;
  /** コンテナに適用する追加のCSSクラス */
  className?: string;
  /** チェックボックスの中間状態（一部選択） */
  indeterminate?: boolean;
  /** チェックボックスの値 */
  value?: string;
}

/**
 * チェックボックスの基本コンポーネント
 *
 * @param checked - チェックボックスの選択状態
 * @param onChange - チェックボックスの変更イベントハンドラ
 * @param label - チェックボックスのラベルテキスト
 * @param className - コンテナに適用する追加のCSSクラス
 * @param indeterminate - チェックボックスの中間状態（一部選択）
 * @param value - チェックボックスの値
 */
const BaseCheckbox: React.FC<BaseCheckboxProps> = ({
  checked,
  onChange,
  label,
  className = '',
  indeterminate = false,
  value,
}) => {
  return (
    <label className={`${checkboxStyles.checkboxContainer} ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        value={value}
        ref={input => {
          if (input) {
            input.indeterminate = indeterminate;
          }
        }}
      />
      <span>{label}</span>
    </label>
  );
};

export default BaseCheckbox;
