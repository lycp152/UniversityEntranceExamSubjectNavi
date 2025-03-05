"use client";

import { useEffect, useState } from "react";
import type { Subject as UISubject } from "@/lib/types/subject/subject";
import type {
  APIUniversity,
  APIDepartment,
  APIMajor,
  APIAdmissionSchedule,
  APITestType,
} from "@/lib/types/university/api";
import { tableStyles } from "./styles";
import { transformSubjectData } from "@/lib/utils/subject/transform";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorMessage } from "@/components/common/ErrorMessage";

const processTestTypes = (
  testType: APITestType,
  apiUniversity: APIUniversity,
  department: APIDepartment,
  major: APIMajor,
  schedule: APIAdmissionSchedule
) => {
  if (!testType?.subjects?.length) {
    console.log("No subjects for test type:", testType.name);
    return null;
  }
  const admissionInfo = schedule.admission_infos?.[0];
  if (!admissionInfo) {
    console.log("No admission info for schedule:", schedule.name);
    return null;
  }
  return transformSubjectData(
    testType.subjects[0],
    testType.subjects,
    apiUniversity,
    department,
    major,
    admissionInfo,
    schedule
  );
};

const processSchedule = (
  schedule: APIAdmissionSchedule,
  apiUniversity: APIUniversity,
  department: APIDepartment,
  major: APIMajor
) => {
  if (!schedule?.test_types) {
    console.log("No test types for schedule:", schedule.name);
    return [];
  }
  return schedule.test_types
    .map((testType) =>
      processTestTypes(testType, apiUniversity, department, major, schedule)
    )
    .filter((subject): subject is UISubject => subject !== null);
};

const processMajor = (
  major: APIMajor,
  apiUniversity: APIUniversity,
  department: APIDepartment
): UISubject[] => {
  if (!major.admission_schedules?.length) {
    console.log("No admission schedules found for major:", major.name);
    return [];
  }
  return major.admission_schedules.flatMap((schedule) =>
    processSchedule(schedule, apiUniversity, department, major)
  );
};

const processDepartment = (
  department: APIDepartment,
  apiUniversity: APIUniversity
): UISubject[] => {
  if (!department?.majors) {
    console.log("No majors for department:", department.name);
    return [];
  }
  return department.majors.flatMap((major) =>
    processMajor(major, apiUniversity, department)
  );
};

const transformUniversityData = (
  universities: APIUniversity[]
): UISubject[] => {
  console.log("Input universities:", universities);
  const transformedSubjectsMap = new Map<string, UISubject>();

  universities.forEach((apiUniversity) => {
    if (!apiUniversity?.departments) {
      console.log("No departments for university:", apiUniversity.name);
      return;
    }

    const subjects = apiUniversity.departments.flatMap((department) =>
      processDepartment(department, apiUniversity)
    );

    subjects.forEach((subject) => {
      const key = `${subject.universityId}-${subject.departmentId}-${subject.majorId}-${subject.admissionScheduleId}`;
      if (!transformedSubjectsMap.has(key)) {
        transformedSubjectsMap.set(key, subject);
      }
    });
  });

  const result = Array.from(transformedSubjectsMap.values());
  console.log("Final transformed data:", result);
  return result;
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
        const responseData = await response.json();
        const data = responseData.data || responseData; // データが.dataプロパティにある場合とない場合の両方に対応

        if (!Array.isArray(data)) {
          console.error("Data is not an array:", typeof data, data); // より詳細なデバッグ情報
          throw new Error("Invalid response format");
        }

        console.log("API response structure:", {
          universities: data.length,
          firstUniversity: data[0]
            ? {
                name: data[0].name,
                departmentsCount: data[0].departments?.length,
                firstDepartment: data[0].departments?.[0]
                  ? {
                      name: data[0].departments[0].name,
                      majorsCount: data[0].departments[0].majors?.length,
                      firstMajor: data[0].departments[0].majors?.[0]
                        ? {
                            name: data[0].departments[0].majors[0].name,
                            schedulesCount:
                              data[0].departments[0].majors[0]
                                .admissionSchedules?.length,
                          }
                        : null,
                    }
                  : null,
              }
            : null,
        }); // デバッグ用

        const transformedData = transformUniversityData(data);
        console.log("Transformed data:", transformedData); // デバッグ用
        setSubjects(transformedData);
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
