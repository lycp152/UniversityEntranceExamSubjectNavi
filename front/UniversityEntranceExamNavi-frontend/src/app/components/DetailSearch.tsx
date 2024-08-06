import React, { useState } from "react";
import RegionCheckbox from "./RegionCheckbox";
import AcademicFieldCheckbox from "./AcademicFieldCheckbox";
import ScheduleCheckbox from "./ScheduleCheckbox";
import ClassificationCheckbox from "./ClassificationCheckbox";

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

export default function DetailSearch({
  region,
  setRegion,
  academicField,
  setAcademicField,
  schedule,
  setSchedule,
  classification,
  setClassification,
}: Readonly<DetailSearchProps>) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="mt-4">
      <div className="flex items-center">
        <h2 className="text-lg font-semibold">詳細検索</h2>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="ml-2 text-gray-600 focus:outline-none"
        >
          {isExpanded ? "▲" : "▼"}
        </button>
      </div>
      {isExpanded && (
        <div className="mt-4">
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
        </div>
      )}
    </div>
  );
}
