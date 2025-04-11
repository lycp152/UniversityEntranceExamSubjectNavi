import { GenericFilter } from './generic';
import { CategoryFilter } from './category';
import { FilterProps } from '../../types/filter';

/**
 * フィルターコンポーネント
 *
 * カテゴリー型と通常型のフィルターを統一的に扱うコンポーネントです。
 * フィルターの設定に応じて適切なフィルターコンポーネントを選択して表示します。
 *
 * @component
 * @example
 * ```tsx
 * // カテゴリー型フィルターの場合
 * <Filter
 *   config={{
 *     isCategory: true,
 *     options: {
 *       "理系": ["理学部", "工学部"],
 *       "文系": ["文学部", "経済学部"]
 *     },
 *     label: "学部"
 *   }}
 *   selectedItems={["理学部"]}
 *   setSelectedItems={setSelectedItems}
 * />
 *
 * // 通常型フィルターの場合
 * <Filter
 *   config={{
 *     isCategory: false,
 *     options: ["東京", "大阪", "名古屋"],
 *     label: "所在地"
 *   }}
 *   selectedItems={["東京"]}
 *   setSelectedItems={setSelectedItems}
 * />
 * ```
 *
 * @param {FilterProps} props - コンポーネントのプロパティ
 * @returns {JSX.Element} フィルターコンポーネント
 */
export const Filter: React.FC<FilterProps> = ({ config, ...props }) => {
  if (config.isCategory) {
    return (
      <CategoryFilter
        categories={config.options as Record<string, string[]>}
        label={config.label}
        {...props}
      />
    );
  }

  return <GenericFilter items={config.options as string[]} label={config.label} {...props} />;
};
