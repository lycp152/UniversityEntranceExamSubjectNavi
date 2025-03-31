import React, { useState } from "react";
import RegionCheckbox from "../filters/RegionCheckbox";
import AcademicFieldCheckbox from "../filters/AcademicFieldCheckbox";
import ScheduleCheckbox from "../filters/ScheduleCheckbox";
import ClassificationCheckbox from "../filters/ClassificationCheckbox";
import { SectionTitle } from "@/components/ui/typography/section-title";

interface DetailSearchProps {
  region: string[];
  setRegion: React.Dispatch<React.SetStateAction<string[]>>;
  academicField: string[];
  setAcademicField: React.Dispatch<React.SetStateAction<string[]>>;
  schedule: string[];
  setSchedule: React.Dispatch<React.SetStateAction<string[]>>;
  classification: string[];
  setClassification: React.Dispatch<React.SetStateAction<string[]>>;
}

const DetailSearch: React.FC<DetailSearchProps> = ({
  region,
  setRegion,
  academicField,
  setAcademicField,
  schedule,
  setSchedule,
  classification,
  setClassification,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded((prev) => !prev);
  };

  const closeSearch = () => {
    setIsExpanded(false);
  };

  return (
    <div className="mt-4">
      <button
        className="flex items-center cursor-pointer focus:outline-none"
        onClick={toggleExpanded}
        aria-expanded={isExpanded}
        aria-controls="detail-search-content"
      >
        <SectionTitle>詳細条件</SectionTitle>
        <span className="ml-2 text-gray-600">{isExpanded ? "▲" : "▼"}</span>
      </button>
      {isExpanded && (
        <div id="detail-search-content" className="mt-4">
          {/* 地域・都道府県 */}
          <div className="mb-4">
            <RegionCheckbox region={region} setRegion={setRegion} />
          </div>
          {/* 学問系統と日程 */}
          <div className="flex space-x-4">
            <div className="flex-1">
              <AcademicFieldCheckbox
                academicField={academicField}
                setAcademicField={setAcademicField}
              />
            </div>
            <div className="flex-1">
              <ScheduleCheckbox schedule={schedule} setSchedule={setSchedule} />
            </div>
          </div>
          {/* 分類 */}
          <div className="mt-4">
            <ClassificationCheckbox
              classification={classification}
              setClassification={setClassification}
            />
          </div>
          {/* 詳細検索を閉じるボタン */}
          <div className="mt-4 flex justify-center">
            <button
              onClick={closeSearch}
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
