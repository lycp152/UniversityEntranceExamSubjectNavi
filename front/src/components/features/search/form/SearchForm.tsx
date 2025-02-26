"use client";

import { useState } from "react";
import SortConditions from "./SortConditions";
import DetailSearch from "./DetailSearch";
import { formStyles } from "./styles";
import { SectionTitle } from "@/components/ui/typography/SectionTitle";

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
    <div className={formStyles.container}>
      <SortConditions sortOrder={sortOrder} setSortOrder={setSortOrder} />
      <form onSubmit={handleSubmit}>
        <div className="mt-4">
          <SectionTitle>キーワードで絞り込む</SectionTitle>
          <input
            type="text"
            id="subject"
            name="subject"
            className={formStyles.input}
            placeholder="例：北海道大学 工学部（空白で全てから検索します）"
            value={subject}
            onChange={handleSubjectChange}
          />
        </div>
      </form>
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
      <div className="mt-4">
        <button type="submit" className={formStyles.button}>
          検索
        </button>
      </div>
    </div>
  );
}
