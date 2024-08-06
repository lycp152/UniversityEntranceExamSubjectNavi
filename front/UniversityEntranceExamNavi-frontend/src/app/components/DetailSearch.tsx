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
}: DetailSearchProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="mt-4">
      <div className="flex items-center">
        <h2 className="text-lg font-semibold">詳細検索</h2>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="ml-2 text-blue-500 focus:outline-none"
        >
          {isExpanded ? "▲" : "▼"}
        </button>
      </div>
      {isExpanded && (
        <div className="flex mt-4">
          <div className="flex-1">
            <RegionCheckbox region={region} setRegion={setRegion} />
          </div>
          <div className="flex-1 space-y-4">
            <AcademicFieldCheckbox
              academicField={academicField}
              setAcademicField={setAcademicField}
            />
            <ScheduleCheckbox schedule={schedule} setSchedule={setSchedule} />
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
