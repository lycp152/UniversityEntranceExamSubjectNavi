import type { ExamSectionsProps } from "@/lib/types/exam/sections";
import { ExamSection } from "@/components/features/exam/sections/ExamSection";
import type { APITestType } from "@/lib/types/university/api";

export const ExamSections = ({
  admissionInfo,
  isEditing,
  onAddSubject,
  onSubjectNameChange,
  onScoreChange,
}: ExamSectionsProps) => {
  const commonType = admissionInfo.testTypes?.find(
    (t: APITestType) => t.name === "共通"
  );
  const secondaryType = admissionInfo.testTypes?.find(
    (t: APITestType) => t.name === "二次"
  );

  return (
    <div className="flex-1 flex gap-8">
      {commonType && (
        <div className="flex-1">
          <ExamSection
            subjects={commonType.subjects}
            type={commonType}
            isEditing={isEditing}
            onScoreChange={(subjectId, value) =>
              onScoreChange(subjectId, value, true)
            }
            onAddSubject={onAddSubject}
            onSubjectNameChange={onSubjectNameChange}
          />
        </div>
      )}
      {secondaryType && (
        <div className="flex-1">
          <ExamSection
            subjects={secondaryType.subjects}
            type={secondaryType}
            isEditing={isEditing}
            onScoreChange={(subjectId, value) =>
              onScoreChange(subjectId, value, false)
            }
            onAddSubject={onAddSubject}
            onSubjectNameChange={onSubjectNameChange}
          />
        </div>
      )}
    </div>
  );
};
