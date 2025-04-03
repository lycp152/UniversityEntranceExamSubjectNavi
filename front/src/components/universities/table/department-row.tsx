import type { DepartmentRowProps } from '@/types/universities/university-list';
import { EditButtons } from '@/components/universities/buttons/edit-buttons';
import { DepartmentInfo } from '@/components/universities/department-info/department-info';
import { ExamSections } from '@/components/admin/exam-sections';
import type { APIAdmissionInfo, APITestType, APISubject } from '@/types/api/api-response-types';

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

  console.log('DepartmentRow Data:', {
    department,
    major,
    admissionSchedule,
    admissionInfo,
  });

  if (!major || !admissionSchedule || !admissionInfo) return null;

  const handleScoreChange = (subjectId: number, value: number, isCommon: boolean) =>
    onScoreChange(university.id, department.id, subjectId, value, isCommon);

  // Convert TestType and Subject to their API counterparts
  const mappedTestTypes: APITestType[] = admissionSchedule.testTypes.map(testType => ({
    id: testType.id,
    admission_schedule_id: testType.admissionScheduleId,
    name: testType.name,
    subjects: testType.subjects.map(subject => ({
      id: subject.id,
      test_type_id: testType.id,
      name: subject.name,
      score: subject.score || 0,
      percentage: subject.percentage || 0,
      display_order: subject.displayOrder,
      created_at: subject.createdAt,
      updated_at: subject.updatedAt,
      deleted_at: subject.deletedAt ?? null,
      version: subject.version,
      created_by: subject.createdBy,
      updated_by: subject.updatedBy,
    })) as APISubject[],
    created_at: testType.createdAt,
    updated_at: testType.updatedAt,
    deleted_at: testType.deletedAt ?? null,
    version: testType.version,
    created_by: testType.createdBy,
    updated_by: testType.updatedBy,
  }));

  const mappedAdmissionInfo: APIAdmissionInfo & { testTypes: APITestType[] } = {
    id: admissionInfo.id,
    admission_schedule_id: admissionInfo.admissionScheduleId,
    academic_year: admissionInfo.academicYear,
    enrollment: admissionInfo.enrollment,
    status: admissionInfo.status,
    created_at: admissionInfo.createdAt,
    updated_at: admissionInfo.updatedAt,
    version: admissionInfo.version,
    created_by: admissionInfo.createdBy,
    updated_by: admissionInfo.updatedBy,
    admission_schedule: {
      id: admissionSchedule.id,
      major_id: admissionSchedule.majorId,
      name: admissionSchedule.name,
      display_order: admissionSchedule.displayOrder,
      test_types: mappedTestTypes,
      admission_infos: [],
      created_at: admissionSchedule.createdAt,
      updated_at: admissionSchedule.updatedAt,
      deleted_at: admissionSchedule.deletedAt ?? null,
      version: admissionSchedule.version,
      created_by: admissionSchedule.createdBy,
      updated_by: admissionSchedule.updatedBy,
    },
    test_types: mappedTestTypes,
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
