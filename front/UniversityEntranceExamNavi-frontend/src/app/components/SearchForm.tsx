"use client";

import { useState } from "react";
import SortConditions from "./SortConditions";
import DetailSearch from "./DetailSearch";

export default function SearchForm() {
  const [subject, setSubject] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<
    { examType: string; subjectName: string; order: string }[]
  >([{ examType: "", subjectName: "", order: "" }]);
  const [region, setRegion] = useState<string[]>([]);
  const [academicField, setAcademicField] = useState<string[]>([]);
  const [schedule, setSchedule] = useState<string[]>([]);
  const [classification, setClassification] = useState<string[]>([]);

  const handleSubjectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSubject(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(
      "Searching for:",
      subject,
      sortOrder,
      region,
      academicField,
      schedule
    );
  };

  return (
    <div className="bg-white shadow p-4 mb-4">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="subject">
            キーワード
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            className="w-full border border-gray-300 p-2"
            placeholder="例：北海道大学 工学部（空白で全てから検索します）"
            value={subject}
            onChange={handleSubjectChange}
          />
        </div>
        <button type="submit" className="bg-blue-600 text-white py-2 px-4">
          検索
        </button>
      </form>

      <SortConditions sortOrder={sortOrder} setSortOrder={setSortOrder} />
      <DetailSearch
        region={region}
        setRegion={setRegion}
        academicField={academicField}
        setAcademicField={setAcademicField}
        schedule={schedule}
        setSchedule={setSchedule}
        classification={classification}
        setClassification={setClassification}
      />
    </div>
  );
}
