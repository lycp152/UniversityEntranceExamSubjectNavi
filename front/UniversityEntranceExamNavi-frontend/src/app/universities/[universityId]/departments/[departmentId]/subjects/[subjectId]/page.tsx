"use client";

import { notFound } from "next/navigation";
import { useEffect, useState } from "react";
import {
  subjects,
  Subject,
} from "../../../../../../components/SearchResultTable/SubjectData";
import SubjectInfo from "../../../../../../components/SubjectDetailPage/SubjectInfo";
import ScoreTable from "../../../../../../components/SubjectDetailPage/ScoreTable";
import PieChart from "../../../../../../components/SubjectDetailPage/PieChart";
import Header from "../../../../../../components/Header"; // Headerをインポート

const SubjectDetailPage = ({
  params,
}: {
  params: { universityId: string; departmentId: string; subjectId: string };
}) => {
  const { universityId, departmentId, subjectId } = params;

  const [subjectDetail, setSubjectDetail] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubjectDetail = () => {
      const subject = subjects.find(
        (subject: Subject) =>
          subject.universityId === parseInt(universityId) &&
          subject.departmentId === parseInt(departmentId) &&
          subject.subjectId === parseInt(subjectId)
      );

      setSubjectDetail(subject ?? null);
      setLoading(false);
    };

    fetchSubjectDetail();
  }, [universityId, departmentId, subjectId]);

  if (loading) {
    return <p>読み込み中...</p>;
  }

  if (!subjectDetail) {
    notFound();
    return null;
  }

  return (
    <>
      <Header />
      <div className="bg-white shadow p-4">
        <div className="flex flex-col lg:flex-row">
          {/* 左側のコンテンツ */}
          <div className="lg:w-1/4 lg:pr-4 mb-4 lg:mb-0">
            <SubjectInfo subjectDetail={subjectDetail} />
          </div>
          {/* 右側のコンテンツ */}
          <div className="flex-1">
            <div className="flex flex-col lg:flex-row lg:gap-4">
              <div className="flex justify-center items-center mb-4 lg:mb-0">
                <PieChart />
              </div>
              <div className="flex justify-center items-center">
                <PieChart />
              </div>
            </div>
          </div>
        </div>
        <ScoreTable subjectScores={subjectDetail.subjectScores} />
      </div>
    </>
  );
};

export default SubjectDetailPage;
