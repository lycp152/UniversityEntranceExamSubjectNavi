/**
 * チェックボックスグループのレイアウトコンポーネント
 *
 * このコンポーネントは、チェックボックスグループのレイアウト構造を提供します。
 * グループ全体のラベル、全選択/解除チェックボックス、および子要素の配置を管理します。
 */
import { checkboxStyles } from './checkbox-styles';
import AllCheckbox from './all-checkbox';

/**
 * CheckboxGroupLayoutコンポーネントのプロパティ
 */
interface CheckboxGroupLayoutProps {
  /** チェックボックスグループのラベル */
  label: string;
  /** すべてのアイテムが選択されているかどうか */
  allChecked: boolean;
  /** 一部のアイテムのみが選択されているかどうか（中間状態） */
  isIndeterminate: boolean;
  /** 全選択/解除チェックボックスの変更イベントハンドラ */
  onAllChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** 子要素 */
  children: React.ReactNode;
  /** コンテナに適用する追加のCSSクラス */
  className?: string;
  containerClassName?: string;
}

/**
 * チェックボックスグループのレイアウトコンポーネント
 *
 * @param label - チェックボックスグループのラベル
 * @param allChecked - すべてのアイテムが選択されているかどうか
 * @param isIndeterminate - 一部のアイテムのみが選択されているかどうか
 * @param onAllChange - 全選択/解除チェックボックスの変更イベントハンドラ
 * @param children - 子要素
 * @param className - コンテナに適用する追加のCSSクラス
 */
const CheckboxGroupLayout: React.FC<CheckboxGroupLayoutProps> = ({
  label,
  allChecked,
  isIndeterminate,
  onAllChange,
  children,
  className = '',
  containerClassName = '',
}) => {
  return (
    <div className={`${checkboxStyles.groupContainer} ${containerClassName}`}>
      <label className={checkboxStyles.groupLabel}>{label}</label>
      <AllCheckbox
        allChecked={allChecked}
        indeterminate={isIndeterminate}
        onChange={onAllChange}
        label="すべて"
      />
      <div className={`${checkboxStyles.itemsContainer} ${className}`}>{children}</div>
    </div>
  );
};

export default CheckboxGroupLayout;
