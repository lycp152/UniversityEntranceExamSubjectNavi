'use client';

import { notFound } from 'next/navigation';
import { useEffect, useState } from 'react';
import { subjects } from '@/features/data/SubjectData';
import type { Subject } from '@/lib/types';
import SubjectInfo from '@/features/subject/components/SubjectDetail/Overview/SubjectInfo';
import { Scores } from '@/features/subject/components/SubjectDetail/Scores';
import Header from '@/components/layout/Header';
import SubjectScoreTable from '@/features/subject/components/SubjectDetail/Scores/SubjectScoreTable';

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
        {/* 上部エリア */}
        <div className="flex flex-col lg:flex-row mb-16">
          {/* 左側の情報 */}
          <div className="lg:w-1/4 lg:pr-4">
            <SubjectInfo subjectDetail={subjectDetail} />
          </div>
          {/* 右側のグラフ */}
          <div className="flex-1 flex bg-transparent">
            <Scores scores={subjectDetail} />
          </div>
        </div>
        {/* 下部の表 */}
        <div>
          <SubjectScoreTable subjectData={subjectDetail} />
        </div>
      </div>
    </>
  );
};

export default SubjectDetailPage;
