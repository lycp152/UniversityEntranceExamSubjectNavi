import type { DepartmentRowProps } from "@/lib/types/university/list";
import { EditButtons } from "@/components/common/EditButtons";
import { DepartmentInfo } from "../department/info";
import { ExamSections } from "@/components/features/exam/sections/ExamSections";
import type { APIExamInfo as AdmissionInfo } from "@/lib/types/university/api";

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
  const admissionInfo = major?.exam_infos[0];

  if (!major || !admissionInfo) return null;

  const handleScoreChange = (
    subjectId: number,
    value: number,
    isCommon: boolean
  ) => onScoreChange(university.id, department.id, subjectId, value, isCommon);

  return (
    <div className="px-4 py-3 hover:bg-gray-50 transition-colors">
      <div className="flex items-start min-w-max">
        <div className="px-3 flex items-center h-full">
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
            admissionInfo={admissionInfo as unknown as AdmissionInfo}
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
