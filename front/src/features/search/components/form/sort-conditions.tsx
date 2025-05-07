import { SectionTitle } from '@/components/ui/section-title';
import { memo, useCallback } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';

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
const SortConditions = memo(function SortConditions({
  sortOrder,
  setSortOrder,
}: SortConditionsProps) {
  /**
   * 並び順の条件を更新する関数
   * @param {number} index - 更新する条件のインデックス
   * @param {keyof SortCondition} field - 更新するフィールド
   * @param {string} value - 新しい値
   */
  const handleSortChange = useCallback(
    (index: number, field: keyof SortCondition, value: string) => {
      setSortOrder(prev => {
        const newSortOrder = [...prev];
        newSortOrder[index] = { ...newSortOrder[index], [field]: value };
        return newSortOrder;
      });
    },
    [setSortOrder]
  );

  return (
    <div>
      <SectionTitle>検索結果の並び順</SectionTitle>
      {sortOrder.map((condition, index) => (
        <div
          key={`${condition.examType}-${condition.subjectName}-${condition.order}`}
          className="flex flex-col md:flex-row items-start md:items-center md:space-x-4 space-y-2 md:space-y-0 w-full"
        >
          <div className="flex items-center w-full md:w-auto">
            <div className="flex-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full"
                    aria-expanded={!!condition.examType}
                    aria-haspopup="listbox"
                    aria-label="試験の種類を選択"
                  >
                    {condition.examType || '試験を選択'} <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>試験の種類</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    {sortOptions.examType.map(option => (
                      <DropdownMenuItem
                        key={option}
                        onClick={() => handleSortChange(index, 'examType', option)}
                        aria-selected={condition.examType === option}
                      >
                        {option}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <span className="ml-2 whitespace-nowrap">の</span>
          </div>

          <div className="flex items-center w-full md:w-auto">
            <div className="flex-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full"
                    aria-expanded={!!condition.subjectName}
                    aria-haspopup="listbox"
                    aria-label="科目名を選択"
                  >
                    {condition.subjectName || '科目名を選択'}{' '}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>科目名</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    {sortOptions.subjectName.map(option => (
                      <DropdownMenuItem
                        key={option}
                        onClick={() => handleSortChange(index, 'subjectName', option)}
                        aria-selected={condition.subjectName === option}
                      >
                        {option}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <span className="ml-2 whitespace-nowrap">の比率が</span>
          </div>

          <div className="flex items-center w-full md:w-auto">
            <div className="flex-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full"
                    aria-expanded={!!condition.order}
                    aria-haspopup="listbox"
                    aria-label="並び順を選択"
                  >
                    {condition.order || '並び順を選択'} <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>並び順</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    {sortOptions.order.map(option => (
                      <DropdownMenuItem
                        key={option}
                        onClick={() => handleSortChange(index, 'order', option)}
                        aria-selected={condition.order === option}
                      >
                        {option}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <span className="ml-2 whitespace-nowrap">順</span>
          </div>
        </div>
      ))}
    </div>
  );
});

export default SortConditions;
