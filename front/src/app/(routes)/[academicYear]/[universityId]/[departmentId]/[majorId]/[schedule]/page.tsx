'use client';

import { notFound } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { ExamInfo, Major } from '@/types/models';
import type { Subject as UISubject } from '@/lib/types';
import SubjectInfo from '@/features/subject/components/SubjectDetail/Overview/SubjectInfo';
import { Scores } from '@/features/subject/components/SubjectDetail/Scores';
import Header from '@/components/layout/Header';
import SubjectScoreTable from '@/features/subject/components/SubjectDetail/Scores/SubjectScoreTable';
import { ErrorMessage } from '@/components/admin/ErrorMessage';
import { LoadingSpinner } from '@/components/admin/LoadingSpinner';
import { transformSubjectData } from '@/lib/transformers/subjectTransformer';

const API_ENDPOINTS = {
  UNIVERSITY: (universityId: string) => `http://localhost:8080/api/universities/${universityId}`,
} as const;

const ExamInfoPage = ({
  params,
}: {
  params: {
    academicYear: string;
    universityId: string;
    departmentId: string;
    majorId: string;
    schedule: string;
  };
}) => {
  const { academicYear, universityId, departmentId, majorId, schedule } = params;

  const [examDetail, setExamDetail] = useState<UISubject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExamDetail = async () => {
      try {
        setLoading(true);
        setError(null);

        const universityResponse = await fetch(API_ENDPOINTS.UNIVERSITY(universityId), {
          headers: {
            'Cache-Control': 'no-cache',
            Pragma: 'no-cache',
          },
        });

        if (!universityResponse.ok) {
          if (universityResponse.status === 404) {
            console.error('University not found:', universityId);
            notFound();
          }
          throw new Error('データの取得に失敗しました。');
        }

        const universityData = await universityResponse.json();
        const department = universityData.departments?.find(
          (dept: any) => dept.ID === parseInt(departmentId, 10)
        );

        if (!department) {
          console.error('Department not found:', departmentId);
          notFound();
          return;
        }

        const major = department.majors?.find((m: Major) => m.ID === parseInt(majorId, 10));

        if (!major) {
          console.error('Major not found:', majorId);
          notFound();
          return;
        }

        const examInfo = major.exam_infos?.find(
          (e: ExamInfo) =>
            e.academic_year === parseInt(academicYear, 10) &&
            e.schedule_id === parseInt(schedule, 10)
        );

        if (!examInfo) {
          console.error('ExamInfo not found:', { academicYear, schedule });
          notFound();
          return;
        }

        // 最初の科目を代表として使用
        const representativeSubject = examInfo.subjects[0];
        if (!representativeSubject) {
          console.error('No subjects found in exam info');
          notFound();
          return;
        }

        const transformedData = transformSubjectData(
          representativeSubject,
          examInfo.subjects,
          universityData,
          department,
          major,
          examInfo
        );
        setExamDetail(transformedData);
      } catch (error) {
        console.error('Failed to fetch exam details:', error);
        setError('データの取得に失敗しました。サーバーが起動しているか確認してください。');
      } finally {
        setLoading(false);
      }
    };

    fetchExamDetail();
  }, [academicYear, universityId, departmentId, majorId, schedule]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!examDetail) {
    notFound();
    return null;
  }

  return (
    <>
      <Header />
      <div className="bg-white shadow p-4">
        <div className="flex flex-col lg:flex-row mb-16">
          <div className="lg:w-1/4 lg:pr-4">
            <SubjectInfo subjectDetail={examDetail} />
          </div>
          <div className="flex-1 flex bg-transparent">
            <Scores scores={examDetail} />
          </div>
        </div>
        <div>
          <SubjectScoreTable subjectData={examDetail} />
        </div>
      </div>
    </>
  );
};

export default ExamInfoPage;
