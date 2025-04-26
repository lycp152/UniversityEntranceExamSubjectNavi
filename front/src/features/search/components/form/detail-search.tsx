import { Region } from '@/features/search/components/filters/region';
import { AcademicField } from '@/features/search/components/filters/academic-field';
import { Schedule } from '@/features/search/components/filters/schedule';
import { Classification } from '@/features/search/components/filters/classification';
import { SectionTitle } from '@/features/search/components/section-title';
import { Button } from '@/components/ui/button';
import { X, ChevronDown, ChevronUp } from 'lucide-react';

/**
 * 詳細検索コンポーネントのプロパティ定義
 * @interface DetailSearchProps
 * @property {string[]} selectedItems - 選択された地域の値の配列
 * @property {React.Dispatch<React.SetStateAction<string[]>>} setSelectedItems - 地域の選択値を更新する関数
 * @property {string[]} academicField - 選択された学問系統の値の配列
 * @property {React.Dispatch<React.SetStateAction<string[]>>} setAcademicField - 学問系統の選択値を更新する関数
 * @property {string[]} schedule - 選択された日程の値の配列
 * @property {React.Dispatch<React.SetStateAction<string[]>>} setSchedule - 日程の選択値を更新する関数
 * @property {string[]} classification - 選択された設置区分の値の配列
 * @property {React.Dispatch<React.SetStateAction<string[]>>} setClassification - 設置区分の選択値を更新する関数
 * @property {boolean} isExpanded - 詳細検索が展開されているかどうか
 * @property {() => void} onToggleExpanded - 詳細検索の展開状態を切り替える関数
 */
interface DetailSearchProps {
  selectedItems: string[];
  setSelectedItems: React.Dispatch<React.SetStateAction<string[]>>;
  academicField: string[];
  setAcademicField: React.Dispatch<React.SetStateAction<string[]>>;
  schedule: string[];
  setSchedule: React.Dispatch<React.SetStateAction<string[]>>;
  classification: string[];
  setClassification: React.Dispatch<React.SetStateAction<string[]>>;
  isExpanded: boolean;
  onToggleExpanded: () => void;
}

/**
 * 詳細検索コンポーネント
 *
 * 大学検索の詳細条件を表示・操作するためのコンポーネントです。
 * 地域、学問系統、日程、設置区分の各フィルターを提供します。
 *
 * @component
 * @param {DetailSearchProps} props - コンポーネントのプロパティ
 * @returns {JSX.Element} 詳細検索コンポーネント
 *
 * @example
 * ```tsx
 * <DetailSearch
 *   selectedItems={region}
 *   setSelectedItems={setRegion}
 *   academicField={academicField}
 *   setAcademicField={setAcademicField}
 *   schedule={schedule}
 *   setSchedule={setSchedule}
 *   classification={classification}
 *   setClassification={setClassification}
 *   isExpanded={isExpanded}
 *   onToggleExpanded={toggleExpanded}
 * />
 * ```
 */
const DetailSearch = ({
  selectedItems,
  setSelectedItems,
  academicField,
  setAcademicField,
  schedule,
  setSchedule,
  classification,
  setClassification,
  isExpanded,
  onToggleExpanded,
}: DetailSearchProps) => {
  return (
    <div className="mt-4">
      <Button
        type="button"
        variant="ghost"
        className="flex items-center cursor-pointer focus:outline-none"
        onClick={onToggleExpanded}
        aria-expanded={isExpanded}
        aria-controls="detail-search-content"
      >
        <SectionTitle>詳細条件</SectionTitle>
        {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
      </Button>
      {isExpanded && (
        <div id="detail-search-content" className="mt-4">
          <div className="mb-4">
            <Region selectedItems={selectedItems} setSelectedItems={setSelectedItems} />
          </div>
          <div className="flex flex-wrap space-x-4">
            <div className="flex-1 min-w-[300px]">
              <AcademicField selectedItems={academicField} setSelectedItems={setAcademicField} />
            </div>
            <div className="flex-1 min-w-[300px]">
              <Schedule selectedItems={schedule} setSelectedItems={setSchedule} />
            </div>
          </div>
          <div className="mt-4">
            <Classification selectedItems={classification} setSelectedItems={setClassification} />
          </div>
          <div className="flex justify-center">
            <Button type="button" variant="ghost" onClick={onToggleExpanded} className="text-lg">
              <X /> 詳細条件を閉じる
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetailSearch;
