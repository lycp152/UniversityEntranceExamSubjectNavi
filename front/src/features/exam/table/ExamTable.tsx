import { Department, University, Subject, TestType } from '@/types/universities/university';
import { DepartmentInfo } from '@/components/universities/department-info/department-info';
import { ExamSection } from '@/components/exam/exam-section';
import { APISubject, APITestType } from '@/types/api/api-response-types';

interface ExamTableProps {
  departments: Department[];
  universities: University[];
  isEditing?: boolean;
  onInfoChange?: (departmentId: number) => (field: string, value: string | number) => void;
  onScoreChange?: (departmentId: number, subjectId: number, value: number) => void;
}

const transformToAPISubject = (subject: Subject): APISubject => ({
  id: subject.id,
  test_type_id: subject.testTypeId,
  name: subject.name,
  score: subject.score,
  percentage: subject.percentage,
  display_order: subject.displayOrder,
  created_at: subject.createdAt,
  updated_at: subject.updatedAt,
  deleted_at: subject.deletedAt ?? null,
  version: subject.version,
  created_by: subject.createdBy,
  updated_by: subject.updatedBy,
});

const transformToAPITestType = (testType: TestType): APITestType => ({
  id: testType.id,
  admission_schedule_id: testType.admissionScheduleId,
  name: testType.name,
  subjects: testType.subjects.map(transformToAPISubject),
  created_at: testType.createdAt,
  updated_at: testType.updatedAt,
  deleted_at: testType.deletedAt ?? null,
  version: testType.version,
  created_by: testType.createdBy,
  updated_by: testType.updatedBy,
});

export const ExamTable = ({
  departments,
  universities,
  isEditing,
  onInfoChange,
  onScoreChange,
}: ExamTableProps) => {
  const getUniversity = (departmentId: number) => {
    const department = departments.find(d => d.id === departmentId);
    return universities.find(u => u.id === department?.universityId);
  };

  const handleInfoChange = (departmentId: number) => {
    return onInfoChange ? onInfoChange(departmentId) : () => {};
  };

  const handleScoreChange = (departmentId: number) => {
    return onScoreChange
      ? (subjectId: number, value: number) => onScoreChange(departmentId, subjectId, value)
      : undefined;
  };

  return (
    <div className="flex flex-col gap-2">
      {departments.map(department => {
        const university = getUniversity(department.id);
        const major = department.majors[0];
        const schedule = major?.admissionSchedules?.[0];
        const examInfo = schedule?.admissionInfos?.[0];
        const commonType = schedule?.testTypes?.find(t => t.name === '共通');
        const secondaryType = schedule?.testTypes?.find(t => t.name === '二次');

        if (!university || !major || !schedule || !examInfo || !commonType || !secondaryType) {
          return null;
        }

        const commonApiType = transformToAPITestType(commonType);
        const secondaryApiType = transformToAPITestType(secondaryType);

        return (
          <div key={department.id} className="flex items-start bg-white rounded-lg shadow-sm p-2">
            <DepartmentInfo
              department={department}
              university={university}
              isEditing={!!isEditing}
              onInfoChange={handleInfoChange(department.id)}
            />
            <ExamSection
              subjects={commonApiType.subjects}
              type={commonApiType}
              isEditing={isEditing}
              onScoreChange={handleScoreChange(department.id)}
            />
            <ExamSection
              subjects={secondaryApiType.subjects}
              type={secondaryApiType}
              isEditing={isEditing}
              onScoreChange={handleScoreChange(department.id)}
            />
          </div>
        );
      })}
    </div>
  );
};
