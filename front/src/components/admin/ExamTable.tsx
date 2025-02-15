import { Department, University } from '@/types/models';
import { DepartmentInfo } from './DepartmentInfo';
import { ExamSection } from './ExamSection';

interface ExamTableProps {
  departments: Department[];
  universities: University[];
  isEditing?: boolean;
  onInfoChange?: (departmentId: number) => (field: string, value: string | number) => void;
  onScoreChange?: (departmentId: number, subjectId: number, value: number) => void;
}

export const ExamTable = ({
  departments,
  universities,
  isEditing,
  onInfoChange,
  onScoreChange,
}: ExamTableProps) => {
  const getUniversity = (departmentId: number) => {
    const department = departments.find((d) => d.ID === departmentId);
    return universities.find((u) => u.ID === department?.university_id);
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
      {departments.map((department) => {
        const university = getUniversity(department.ID);
        const major = department.majors[0];
        const examInfo = major?.exam_infos[0];

        if (!university || !major || !examInfo) {
          return null;
        }

        return (
          <div key={department.ID} className="flex items-start bg-white rounded-lg shadow-sm p-2">
            <DepartmentInfo
              department={department}
              university={university}
              isEditing={!!isEditing}
              onInfoChange={handleInfoChange(department.ID)}
            />
            <ExamSection
              subjects={examInfo.subjects}
              type="共通"
              isEditing={isEditing}
              onScoreChange={handleScoreChange(department.ID)}
            />
            <ExamSection
              subjects={examInfo.subjects}
              type="二次"
              isEditing={isEditing}
              onScoreChange={handleScoreChange(department.ID)}
            />
          </div>
        );
      })}
    </div>
  );
};
