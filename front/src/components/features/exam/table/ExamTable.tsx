import { Department, University } from "@/lib/types/university";
import { DepartmentInfo } from "../../university/department/info";
import { ExamSection } from "../sections/ExamSection";

interface ExamTableProps {
  departments: Department[];
  universities: University[];
  isEditing?: boolean;
  onInfoChange?: (
    departmentId: number
  ) => (field: string, value: string | number) => void;
  onScoreChange?: (
    departmentId: number,
    subjectId: number,
    value: number
  ) => void;
}

export const ExamTable = ({
  departments,
  universities,
  isEditing,
  onInfoChange,
  onScoreChange,
}: ExamTableProps) => {
  const getUniversity = (departmentId: number) => {
    const department = departments.find((d) => d.id === departmentId);
    return universities.find((u) => u.id === department?.universityId);
  };

  const handleInfoChange = (departmentId: number) => {
    return onInfoChange ? onInfoChange(departmentId) : () => {};
  };

  const handleScoreChange = (departmentId: number) => {
    return onScoreChange
      ? (subjectId: number, value: number) =>
          onScoreChange(departmentId, subjectId, value)
      : undefined;
  };

  return (
    <div className="flex flex-col gap-2">
      {departments.map((department) => {
        const university = getUniversity(department.id);
        const major = department.majors[0];
        const examInfo = major?.examInfos[0];

        if (!university || !major || !examInfo) {
          return null;
        }

        return (
          <div
            key={department.id}
            className="flex items-start bg-white rounded-lg shadow-sm p-2"
          >
            <DepartmentInfo
              department={department}
              university={university}
              isEditing={!!isEditing}
              onInfoChange={handleInfoChange(department.id)}
            />
            <ExamSection
              subjects={examInfo.subjects}
              type="共通"
              isEditing={isEditing}
              onScoreChange={handleScoreChange(department.id)}
            />
            <ExamSection
              subjects={examInfo.subjects}
              type="二次"
              isEditing={isEditing}
              onScoreChange={handleScoreChange(department.id)}
            />
          </div>
        );
      })}
    </div>
  );
};
