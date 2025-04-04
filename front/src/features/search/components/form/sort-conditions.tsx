import { SectionTitle } from '@/components/ui/typography/section-title';

/**
 * 並び順の条件を表すインターフェース
 * @interface SortCondition
 * @property {string} examType - 試験の種類（共通テスト、二次試験など）
 * @property {string} subjectName - 科目名
 * @property {string} order - 並び順（高い、低い）
 */
interface SortCondition {
  examType: string;
  subjectName: string;
  order: string;
}

/**
 * 並び順コンポーネントのプロパティ定義
 * @interface SortConditionsProps
 * @property {SortCondition[]} sortOrder - 現在の並び順の条件
 * @property {React.Dispatch<React.SetStateAction<SortCondition[]>>} setSortOrder - 並び順の条件を更新する関数
 */
interface SortConditionsProps {
  readonly sortOrder: SortCondition[];
  readonly setSortOrder: React.Dispatch<React.SetStateAction<SortCondition[]>>;
}

/**
 * 並び順の選択肢
 * @type {Object}
 * @property {string[]} examType - 試験の種類の選択肢
 * @property {string[]} subjectName - 科目名の選択肢
 * @property {string[]} order - 並び順の選択肢
 */
const sortOptions = {
  examType: ['共通テスト', '二次試験', '共通テスト + 二次試験'],
  subjectName: [
    '英語R（リーディング）',
    '英語L（リスニング）',
    '英語R + L',
    '数学',
    '国語',
    '理科',
    '地歴公',
  ],
  order: ['高い', '低い'],
};

/**
 * セレクトボックスコンポーネント
 *
 * 並び順の条件を選択するためのセレクトボックスを提供します。
 *
 * @component
 * @param {Object} props - コンポーネントのプロパティ
 * @param {string} props.value - 現在の選択値
 * @param {string[]} props.options - 選択肢の配列
 * @param {(value: string) => void} props.onChange - 選択値が変更されたときに呼び出される関数
 * @param {string} props.placeholder - プレースホルダーテキスト
 * @returns {JSX.Element} セレクトボックスコンポーネント
 */
const Select = ({
  value,
  options,
  onChange,
  placeholder,
}: {
  value: string;
  options: string[];
  onChange: (value: string) => void;
  placeholder: string;
}) => (
  <div className="w-full">
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="border border-gray-300 p-2 w-full"
    >
      <option value="">{placeholder}</option>
      {options.map(option => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  </div>
);

/**
 * 並び順コンポーネント
 *
 * 検索結果の並び順を設定するためのコンポーネントです。
 * 試験の種類、科目名、並び順を選択できます。
 *
 * @component
 * @param {SortConditionsProps} props - コンポーネントのプロパティ
 * @returns {JSX.Element} 並び順コンポーネント
 *
 * @example
 * ```tsx
 * <SortConditions
 *   sortOrder={sortOrder}
 *   setSortOrder={setSortOrder}
 * />
 * ```
 */
export default function SortConditions({ sortOrder, setSortOrder }: SortConditionsProps) {
  /**
   * 並び順の条件を更新する関数
   * @param {number} index - 更新する条件のインデックス
   * @param {keyof SortCondition} field - 更新するフィールド
   * @param {string} value - 新しい値
   */
  const handleSortChange = (index: number, field: keyof SortCondition, value: string) => {
    const newSortOrder = [...sortOrder];
    newSortOrder[index] = { ...newSortOrder[index], [field]: value };
    setSortOrder(newSortOrder);
  };

  return (
    <div className="mb-4">
      <SectionTitle>検索結果の並び順</SectionTitle>
      {sortOrder.map((condition, index) => (
        <div
          key={`${condition.examType}-${condition.subjectName}-${condition.order}`}
          className="flex flex-col md:flex-row items-start md:items-center md:space-x-4 space-y-2 md:space-y-0 mt-2 w-full"
        >
          <div className="flex items-center w-full">
            <Select
              value={condition.examType}
              options={sortOptions.examType}
              onChange={value => handleSortChange(index, 'examType', value)}
              placeholder="試験を選択"
            />
            <span className="ml-2">の</span>
          </div>
          <div className="flex items-center w-full">
            <Select
              value={condition.subjectName}
              options={sortOptions.subjectName}
              onChange={value => handleSortChange(index, 'subjectName', value)}
              placeholder="科目名を選択"
            />
            <span className="ml-2 whitespace-nowrap">の比率が</span>
          </div>
          <div className="flex items-center w-full">
            <Select
              value={condition.order}
              options={sortOptions.order}
              onChange={value => handleSortChange(index, 'order', value)}
              placeholder="並び順を選択"
            />
            <span className="ml-2">順</span>
          </div>
        </div>
      ))}
    </div>
  );
}
