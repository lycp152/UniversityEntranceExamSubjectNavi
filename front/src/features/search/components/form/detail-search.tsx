import React from 'react';
import { Region } from '../filters/region';
import { AcademicField } from '../filters/academic-field';
import { Schedule } from '../filters/schedule';
import { Classification } from '../filters/classification';
import { SectionTitle } from '@/components/ui/typography/section-title';

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
const DetailSearch: React.FC<DetailSearchProps> = ({
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
}) => {
  return (
    <div className="mt-4">
      <button
        type="button"
        className="flex items-center cursor-pointer focus:outline-none"
        onClick={onToggleExpanded}
        aria-expanded={isExpanded}
        aria-controls="detail-search-content"
      >
        <SectionTitle>詳細条件</SectionTitle>
        <span className="ml-2 text-gray-600">{isExpanded ? '▲' : '▼'}</span>
      </button>
      {isExpanded && (
        <div id="detail-search-content" className="mt-4">
          <div className="mb-4">
            <Region selectedItems={selectedItems} setSelectedItems={setSelectedItems} />
          </div>
          <div className="flex space-x-4">
            <div className="flex-1">
              <AcademicField selectedItems={academicField} setSelectedItems={setAcademicField} />
            </div>
            <div className="flex-1">
              <Schedule selectedItems={schedule} setSelectedItems={setSchedule} />
            </div>
          </div>
          <div className="mt-4">
            <Classification selectedItems={classification} setSelectedItems={setClassification} />
          </div>
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={onToggleExpanded}
              className="text-blue-600 hover:text-blue-700 py-2 px-4 rounded flex items-center focus:outline-none"
            >
              <span className="mr-2">×</span> 詳細条件を閉じる
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetailSearch;
