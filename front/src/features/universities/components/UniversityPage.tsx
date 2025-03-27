"use client";

import { useState, useEffect, use } from "react";
import { notFound } from "next/navigation";
import { ScoreDisplay } from "@/features/universities/utils/ScoreDisplay";
import SubjectInfo from "@/features/universities/utils/SubjectInfo";
import SubjectScoreTable from "@/features/universities/table";
import { ErrorMessage } from "@/components/errors/error-message";
import { LoadingSpinner } from "@/components/ui/feedback/loading-spinner";
import { transformSubjectData } from "@/utils/transformers/subject-mapper";
import { UniversityService } from "@/features/universities/lib/university-service";
import type {
  APIUniversity,
  APIDepartment,
  APIMajor,
  APIAdmissionSchedule,
  APITestType,
} from "@/lib/api/types/models";
import type { UISubject } from "@/types/universities/subjects";
import { UniversityPageParams } from "@/features/universities/types/params";

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
  params: Promise<UniversityPageParams>;
}

const UniversityPage = ({ params }: Props) => {
  const resolvedParams = use(params);
  const { academicYear, universityId, departmentId, majorId, schedule } =
    resolvedParams;

  const [selectedSubject, setSelectedSubject] = useState<UISubject | null>(
    null
  );
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
        console.log("API Response:", universityData);
        const result = findDepartmentAndMajor(
          universityData,
          departmentId,
          majorId
        );

        if (!result) {
          throw new Error("Department or major not found");
        }

        const { department, major } = result;
        const admissionSchedule = major.admission_schedules?.find(
          (s: APIAdmissionSchedule) => s.id === parseInt(schedule, 10)
        );

        if (!admissionSchedule) {
          throw new Error("Admission schedule not found");
        }

        console.log(
          "Admission Schedule:",
          JSON.stringify(admissionSchedule, null, 2)
        );
        console.log("Test Types:", admissionSchedule.test_types);

        const admissionInfo = admissionSchedule.admission_infos?.[0];
        console.log("Academic Year from URL:", academicYear);
        console.log("Admission Infos:", admissionSchedule.admission_infos);
        if (
          !admissionInfo ||
          admissionInfo.academic_year !== parseInt(academicYear, 10)
        ) {
          throw new Error(
            "Admission info not found for the specified academic year"
          );
        }

        if (!admissionSchedule.test_types) {
          throw new Error("Test types not found in admission schedule");
        }

        const allSubjectsData = admissionSchedule.test_types.flatMap(
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
          admissionInfo,
          admissionSchedule
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

export default UniversityPage;
