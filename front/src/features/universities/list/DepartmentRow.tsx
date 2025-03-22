import type { DepartmentRowProps } from "@/types/university/university-list";
import { EditButtons } from "@/features/universities/buttons/EditButtons";
import { DepartmentInfo } from "../department/info";
import { ExamSections } from "@/features/exam/sections/ExamSections";
import type {
  APIAdmissionInfo,
  APITestType,
  APISubject,
} from "@/types/api/api-types";

export const DepartmentRow = ({
  university,
  department,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onScoreChange,
  onInfoChange,
  onAddSubject,
  onSubjectNameChange,
}: DepartmentRowProps) => {
  const major = department.majors[0];
  const admissionSchedule = major?.admissionSchedules?.[0];
  const admissionInfo = admissionSchedule?.admissionInfos?.[0];

  console.log("DepartmentRow Data:", {
    department,
    major,
    admissionSchedule,
    admissionInfo,
  });

  if (!major || !admissionSchedule || !admissionInfo) return null;

  const handleScoreChange = (
    subjectId: number,
    value: number,
    isCommon: boolean
  ) => onScoreChange(university.id, department.id, subjectId, value, isCommon);

  // Convert TestType and Subject to their API counterparts
  const mappedTestTypes: APITestType[] = admissionSchedule.testTypes.map(
    (testType) => ({
      id: testType.id,
      admission_schedule_id: testType.admissionScheduleId,
      name: testType.name,
      subjects: testType.subjects.map((subject) => ({
        id: subject.id,
        test_type_id: testType.id,
        name: subject.name,
        score: subject.maxScore || 0,
        percentage: subject.weight || 0,
        display_order: 0,
        created_at: subject.createdAt.toISOString(),
        updated_at: subject.updatedAt.toISOString(),
      })) as APISubject[],
      created_at: testType.createdAt.toISOString(),
      updated_at: testType.updatedAt.toISOString(),
    })
  );

  const mappedAdmissionInfo: APIAdmissionInfo & { testTypes?: APITestType[] } =
    {
      id: admissionInfo.id,
      major_id: admissionInfo.majorId,
      academic_year: admissionInfo.academicYear,
      enrollment: admissionInfo.enrollment,
      status: admissionInfo.status,
      created_at: admissionInfo.created_at,
      updated_at: admissionInfo.updated_at,
      testTypes: mappedTestTypes,
    };

  return (
    <div className="px-4 py-3 hover:bg-gray-50 transition-colors">
      <div className="flex items-start min-w-max">
        <div className="flex-shrink-0 pr-4">
          <EditButtons
            isEditing={isEditing}
            onEdit={() => onEdit(university, department)}
            onSave={() => onSave(university, department)}
            onCancel={onCancel}
          />
        </div>
        <div className="flex-1 flex items-start gap-4">
          <DepartmentInfo
            department={department}
            university={university}
            isEditing={isEditing}
            onInfoChange={(field, value) =>
              onInfoChange(university.id, department.id, field, value)
            }
          />
          <ExamSections
            admissionInfo={mappedAdmissionInfo}
            isEditing={isEditing}
            onScoreChange={handleScoreChange}
            onAddSubject={onAddSubject}
            onSubjectNameChange={onSubjectNameChange}
          />
        </div>
      </div>
    </div>
  );
};
