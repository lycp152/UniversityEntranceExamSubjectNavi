/**
 * チェックボックスアイテムコンポーネント
 *
 * このコンポーネントは、個別のチェックボックスアイテムを表示します。
 * 選択状態の表示、ラベルの表示、およびクリックイベントの処理をサポートします。
 */
import React from 'react';
import BaseCheckbox from './base-checkbox';

/**
 * CheckboxItemコンポーネントのプロパティ
 *
 * @template T - チェックボックスアイテムの型
 */
interface CheckboxItemProps<T> {
  /** チェックボックスのアイテム */
  item: T;
  /** チェックボックスの選択状態 */
  checked: boolean;
  /** チェックボックスの変更イベントハンドラ */
  onChange: (checked: boolean) => void;
  /** チェックボックスのラベル */
  label: string | ((item: T) => string);
}

/**
 * チェックボックスアイテムコンポーネント
 *
 * @template T - チェックボックスアイテムの型
 * @param item - チェックボックスのアイテム
 * @param checked - チェックボックスの選択状態
 * @param onChange - チェックボックスの変更イベントハンドラ
 * @param label - チェックボックスのラベル
 */
const CheckboxItem = <T,>({ item, checked, onChange, label }: CheckboxItemProps<T>) => {
  return (
    <BaseCheckbox
      checked={checked}
      onChange={e => onChange(e.target.checked)}
      label={typeof label === 'function' ? label(item) : label}
      value={String(item)}
    />
  );
};

export default CheckboxItem;
