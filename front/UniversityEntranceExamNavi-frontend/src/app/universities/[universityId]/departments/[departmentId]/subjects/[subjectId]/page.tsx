"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  subjects,
  Subject,
} from "../../../../../../components/SearchResultTable/SubjectData";
import DetailSection from "../../../../../../components/SubjectDetailPage/DetailSection";
import ScoreTable from "../../../../../../components/SubjectDetailPage/ScoreTable";

const SubjectDetailPage = ({
  params,
}: {
  params: { universityId: string; departmentId: string; subjectId: string };
}) => {
  useRouter();
  const { universityId, departmentId, subjectId } = params;

  const [subjectDetail, setSubjectDetail] = useState<Subject | null>(null);

  useEffect(() => {
    const fetchSubjectDetail = () => {
      const subject = subjects.find(
        (subject: Subject) =>
          subject.universityId === parseInt(universityId) &&
          subject.departmentId === parseInt(departmentId) &&
          subject.subjectId === parseInt(subjectId)
      );

      setSubjectDetail(subject ?? null);
    };

    fetchSubjectDetail();
  }, [universityId, departmentId, subjectId]);

  return (
    <div className="bg-white shadow p-4">
      {subjectDetail ? (
        <>
          <h1 className="text-xl font-bold mb-4">
            {subjectDetail.universityName}
          </h1>
          <DetailSection
            label="学部・募集枠"
            value={subjectDetail.department}
          />
          <DetailSection label="学科・専攻" value={subjectDetail.major} />
          <DetailSection label="日程" value={`${subjectDetail.schedule}期`} />
          <DetailSection
            label="募集人員"
            value={`${subjectDetail.enrollment} 名`}
          />
          <ScoreTable subjectScores={subjectDetail.subjectScores} />
        </>
      ) : (
        <p>情報が見つかりません。</p>
      )}
    </div>
  );
};

export default SubjectDetailPage;
