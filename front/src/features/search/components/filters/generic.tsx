/**
 * 一般的なチェックボックスフィルターの共通コンポーネント
 */

import GenericCheckboxGroup from '../../components/checkbox/simple-checkbox-group';
import { FilterCheckboxProps } from '../../types/filter';

/**
 * 汎用フィルターのプロパティ
 *
 * @interface GenericFilterProps
 * @extends {FilterCheckboxProps}
 * @property {string[]} items - 選択肢の配列
 * @property {string} label - フィルターのラベル
 */
interface GenericFilterProps extends FilterCheckboxProps {
  /** 選択肢の配列 */
  items: string[];
  /** フィルターのラベル */
  label: string;
}

/**
 * 汎用フィルターコンポーネント
 *
 * 単一レベルの選択肢を表示し、複数選択可能なフィルターコンポーネントです。
 * 大学の所在地や入試方式など、単一レベルのデータのフィルタリングに使用します。
 *
 * @component
 * @example
 * ```tsx
 * <汎用フィルター
 *   items={["東京", "大阪", "愛知"]}
 *   selectedItems={["東京"]}
 *   setSelectedItems={setSelectedItems}
 *   label="所在地"
 * />
 * ```
 *
 * @accessibility
 * - WAI-ARIAガイドラインに準拠
 * - キーボードナビゲーション対応（Tab、Space）
 * - スクリーンリーダー対応
 * - フォーカス可視性の保証
 */
export const GenericFilter = ({
  items,
  selectedItems,
  setSelectedItems,
  label,
}: GenericFilterProps) => {
  if (!items || !Array.isArray(items)) {
    console.error('汎用フィルター: itemsは配列である必要があります');
    return null;
  }

  if (!label) {
    console.error('汎用フィルター: labelは必須です');
    return null;
  }

  return (
    <GenericCheckboxGroup
      items={items}
      selectedItems={selectedItems}
      setSelectedItems={setSelectedItems}
      label={label}
      aria-label={`${label}フィルター`}
      aria-describedby={`${label}-description`}
    />
  );
};
