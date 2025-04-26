/**
 * チェックボックスの基本コンポーネント
 *
 * このコンポーネントは、チェックボックスの基本機能を提供します。
 * 選択状態の表示、ラベルの表示、およびクリックイベントの処理をサポートします。
 */
import * as React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { CheckIcon, MinusIcon } from 'lucide-react';
import { cn } from '@/styles/tailwind-utils';

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
    <label className={`flex items-center gap-2 pl-2${className}`}>
      <CheckboxPrimitive.Root
        data-slot="checkbox"
        className={cn(
          'peer border-input dark:bg-input/30 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:data-[state=checked]:bg-primary data-[state=checked]:border-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-4 shrink-0 rounded-[4px] border shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        checked={checked}
        onCheckedChange={checked => {
          onChange({
            target: { checked: checked as boolean, value },
          } as React.ChangeEvent<HTMLInputElement>);
        }}
      >
        <CheckboxPrimitive.Indicator
          data-slot="checkbox-indicator"
          className="flex items-center justify-center text-current transition-none"
        >
          {indeterminate ? <MinusIcon className="size-3.5" /> : <CheckIcon className="size-3.5" />}
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      <span>{label}</span>
    </label>
  );
};

export default BaseCheckbox;
