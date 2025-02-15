'use client';

import { useEffect, useState } from 'react';
import type { Subject as UISubject } from '@/lib/types';
import { tableStyles } from './SearchResultTable/styles';
import { transformSubjectData } from '@/lib/transformers/subjectTransformer';
import { LoadingSpinner } from '@/components/admin/LoadingSpinner';
import { ErrorMessage } from '@/components/admin/ErrorMessage';

const API_ENDPOINTS = {
  UNIVERSITIES: 'http://localhost:8080/api/universities',
} as const;

const transformUniversityData = (universities: any[]): UISubject[] => {
  const transformedSubjects: UISubject[] = [];

  for (const university of universities) {
    for (const department of university.departments ?? []) {
      for (const major of department.majors ?? []) {
        for (const examInfo of major.exam_infos ?? []) {
          if (examInfo.subjects?.length > 0) {
            transformedSubjects.push(
              transformSubjectData(
                examInfo.subjects[0],
                examInfo.subjects,
                university,
                department,
                major,
                examInfo
              )
            );
          }
        }
      }
    }
  }

  return transformedSubjects;
};

const SearchResultTable = () => {
  const [subjects, setSubjects] = useState<UISubject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(API_ENDPOINTS.UNIVERSITIES, {
          headers: {
            'Cache-Control': 'no-cache',
            Pragma: 'no-cache',
          },
        });

        if (!response.ok) {
          throw new Error('データの取得に失敗しました。');
        }

        const universities = await response.json();
        setSubjects(transformUniversityData(universities));
      } catch (error) {
        console.error('Failed to fetch universities:', error);
        setError('データの取得に失敗しました。サーバーが起動しているか確認してください。');
      } finally {
        setLoading(false);
      }
    };

    fetchUniversities();
  }, []);

  // タイトルの生成
  const title = `大学入試科目の配点比率`;

  // 行クリック時のハンドラ
  const handleRowClick = (
    academicYear: number,
    universityId: number,
    departmentId: number,
    majorId: number,
    scheduleId: number
  ) => {
    const url = `/${academicYear}/${universityId}/${departmentId}/${majorId}/${scheduleId}`;
    window.open(url, '_blank');
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className={tableStyles.container}>
      <h2 className={tableStyles.title}>{title}</h2>
      <div className={tableStyles.tableWrapper}>
        <table className={tableStyles.table}>
          <thead>
            <tr>
              <th className={tableStyles.th}>大学名</th>
              <th className={tableStyles.th}>学部</th>
              <th className={tableStyles.th}>学科</th>
              <th className={tableStyles.th}>日程</th>
              <th className={tableStyles.th}>募集人員</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((subject: UISubject) => (
              <tr
                key={`${subject.universityId}-${subject.departmentId}-${subject.majorId}-${subject.scheduleId}`}
                className={tableStyles.row}
                onClick={() =>
                  handleRowClick(
                    subject.academicYear,
                    subject.universityId,
                    subject.departmentId,
                    subject.majorId,
                    subject.scheduleId
                  )
                }
              >
                <td className={tableStyles.td}>{subject.universityName}</td>
                <td className={tableStyles.td}>{subject.department}</td>
                <td className={tableStyles.td}>{subject.major}</td>
                <td className={tableStyles.td}>{subject.schedule}</td>
                <td className={tableStyles.td}>{subject.enrollment} 名</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SearchResultTable;
