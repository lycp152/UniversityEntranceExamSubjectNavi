/**
 * チェックボックスグループのレイアウトコンポーネント
 *
 * このコンポーネントは、チェックボックスグループのレイアウト構造を提供します。
 * グループ全体のラベル、全選択/解除チェックボックス、および子要素の配置を管理します。
 */
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
const CheckboxGroupLayout = ({
  label,
  allChecked,
  isIndeterminate,
  onAllChange,
  children,
  className = '',
  containerClassName = '',
}: CheckboxGroupLayoutProps) => {
  return (
    <div className={`mt-2 mb-4 ${containerClassName}`}>
      <label className="block mb-2 text-gray-700 dark:text-gray-300">{label}</label>
      <AllCheckbox
        allChecked={allChecked}
        indeterminate={isIndeterminate}
        onChange={onAllChange}
        label="すべて"
      />
      <div className={`flex flex-wrap ml-2 ${className}`}>{children}</div>
    </div>
  );
};

export default CheckboxGroupLayout;
