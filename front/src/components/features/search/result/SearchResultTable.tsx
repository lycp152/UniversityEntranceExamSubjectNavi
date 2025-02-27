"use client";

import { useEffect, useState } from "react";
import type { Subject as UISubject } from "@/lib/types/subject/subject";
import type {
  APIUniversity,
  APIDepartment,
  APIMajor,
  APIExamInfo,
  APIAdmissionSchedule,
  APITestType,
} from "@/lib/types/university/api";
import { tableStyles } from "./styles";
import { transformSubjectData } from "@/lib/utils/subject/transform";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorMessage } from "@/components/common/ErrorMessage";

const transformUniversityData = (
  universities: APIUniversity[]
): UISubject[] => {
  const transformedSubjectsMap = new Map<string, UISubject>();

  universities.forEach((apiUniversity) => {
    if (!apiUniversity?.departments) return;

    apiUniversity.departments.forEach((department: APIDepartment) => {
      if (!department?.majors) return;

      department.majors.forEach((major: APIMajor) => {
        if (!major?.exam_infos) return;

        const subjects = major.exam_infos
          .flatMap((info: APIExamInfo) => info.admissionSchedules ?? [])
          .flatMap(
            (schedule: APIAdmissionSchedule) => schedule.test_types ?? []
          )
          .filter((testType: APITestType) => testType?.subjects?.length > 0)
          .map((testType: APITestType) => {
            const subject = transformSubjectData(
              testType.subjects[0],
              testType.subjects,
              apiUniversity,
              department,
              major,
              major.exam_infos[0],
              major.exam_infos[0].admissionSchedules[0]
            );
            return subject;
          })
          .filter((subject): subject is UISubject => subject !== null);

        subjects.forEach((subject) => {
          const key = `${subject.universityId}-${subject.departmentId}-${subject.majorId}-${subject.admissionScheduleId}`;
          if (!transformedSubjectsMap.has(key)) {
            transformedSubjectsMap.set(key, subject);
          }
        });
      });
    });
  });

  return Array.from(transformedSubjectsMap.values());
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

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/universities`
        );
        const universities = await response.json();

        if (!Array.isArray(universities)) {
          throw new Error("Invalid response format");
        }

        setSubjects(transformUniversityData(universities));
      } catch (error) {
        console.error("Failed to fetch universities:", error);
        setError(
          "データの取得に失敗しました。サーバーが起動しているか確認してください。"
        );
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
    admissionScheduleId: number
  ) => {
    const url = `/universities/${academicYear}/${universityId}/${departmentId}/${majorId}/${admissionScheduleId}`;
    window.open(url, "_blank");
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (subjects.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-xl text-gray-600">データが見つかりませんでした。</p>
        <p className="mt-2 text-gray-500">
          現在、データベースに大学情報が登録されていません。
        </p>
      </div>
    );
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
                key={`${subject.universityId}-${subject.departmentId}-${subject.majorId}-${subject.admissionScheduleId}`}
                className={tableStyles.row}
                onClick={() =>
                  handleRowClick(
                    subject.academicYear,
                    subject.universityId,
                    subject.departmentId,
                    subject.majorId,
                    subject.admissionScheduleId
                  )
                }
              >
                <td className={tableStyles.td}>{subject.universityName}</td>
                <td className={tableStyles.td}>{subject.department}</td>
                <td className={tableStyles.td}>{subject.major}</td>
                <td className={tableStyles.td}>{subject.admissionSchedule}</td>
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
