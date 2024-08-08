"use client";

import { notFound } from "next/navigation";
import { useEffect, useState } from "react";
import {
  subjects,
  Subject,
} from "../../../../../../components/SearchResultTable/SubjectData";
import SubjectInfo from "../../../../../../components/SubjectDetailPage/SubjectInfo";
import ScoreTable from "../../../../../../components/SubjectDetailPage/ScoreTable";

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
      setLoading(false); // データ読み込みが完了したら、loadingをfalseにする
    };

    fetchSubjectDetail();
  }, [universityId, departmentId, subjectId]);

  if (loading) {
    return <p>読み込み中...</p>; // 読み込み中のメッセージを表示
  }

  if (!subjectDetail) {
    notFound(); // 情報が見つからない場合、デフォルトのnotfoundページを表示
    return null;
  }

  return (
    <div className="bg-white shadow p-4">
      <SubjectInfo subjectDetail={subjectDetail} />
      <ScoreTable subjectScores={subjectDetail.subjectScores} />
    </div>
  );
};

export default SubjectDetailPage;
