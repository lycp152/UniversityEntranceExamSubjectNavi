"use client";

import { useState, useEffect, use } from "react";
import { notFound } from "next/navigation";
import { ScoreDisplay } from "@/components/features/subject/score/ScoreDisplay";
import SubjectInfo from "@/components/features/subject/detail/overview/SubjectInfo";
import SubjectScoreTable from "@/components/features/subject/score/table";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { transformSubjectData } from "@/lib/utils/subject/transform";
import { UniversityService } from "@/shared/api/services/university";
import type {
  APIUniversity,
  APIDepartment,
  APIMajor,
  APIExamInfo,
  APIAdmissionSchedule,
  APITestType,
} from "@/lib/types/university/api";
import type { Subject } from "@/lib/types/subject/subject";

const findDepartmentAndMajor = (
  university: APIUniversity,
  departmentId: string,
  majorId: string
): { department: APIDepartment; major: APIMajor } | null => {
  const department = university.departments?.find(
    (d) => d.id === parseInt(departmentId, 10)
  );

  if (!department) {
    return null;
  }

  const major = department.majors?.find((m) => m.id === parseInt(majorId, 10));

  if (!major) {
    return null;
  }

  return { department, major };
};

interface Props {
  params: Promise<{
    academicYear: string;
    universityId: string;
    departmentId: string;
    majorId: string;
    schedule: string;
  }>;
}

const ExamInfoPage = ({ params }: Props) => {
  const resolvedParams = use(params);
  const { academicYear, universityId, departmentId, majorId, schedule } =
    resolvedParams;

  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const universityData = await UniversityService.getUniversity(
          universityId
        );
        const result = findDepartmentAndMajor(
          universityData,
          departmentId,
          majorId
        );

        if (!result) {
          throw new Error("Department or major not found");
        }

        const { department, major } = result;
        const examData = major.exam_infos?.find(
          (e: APIExamInfo) => e.academic_year === parseInt(academicYear, 10)
        );

        if (!examData) {
          throw new Error("Exam info not found");
        }

        const admissionScheduleData = examData.admissionSchedules.find(
          (s: APIAdmissionSchedule) => s.id === parseInt(schedule, 10)
        );

        if (!admissionScheduleData) {
          throw new Error("Admission schedule not found");
        }

        const allSubjectsData = admissionScheduleData.test_types.flatMap(
          (testType: APITestType) => testType.subjects
        );

        if (!allSubjectsData.length) {
          throw new Error("No subjects found");
        }

        const transformedSubject = transformSubjectData(
          allSubjectsData[0],
          allSubjectsData,
          universityData,
          department,
          major,
          examData,
          admissionScheduleData
        );

        if (!transformedSubject) {
          throw new Error("Failed to transform subject data");
        }

        setSelectedSubject(transformedSubject);
      } catch (error) {
        console.error("Failed to fetch exam details:", error);
        setError(error instanceof Error ? error.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [academicYear, universityId, departmentId, majorId, schedule]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!selectedSubject) {
    notFound();
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row mb-16">
        <div className="lg:w-1/4 lg:pr-4">
          <SubjectInfo subjectDetail={selectedSubject} />
        </div>
        <div className="flex-1 flex bg-transparent">
          <ScoreDisplay subject={selectedSubject} />
        </div>
      </div>
      <div>
        <SubjectScoreTable subjectData={selectedSubject} />
      </div>
    </div>
  );
};

export default ExamInfoPage;
