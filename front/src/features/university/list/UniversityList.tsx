import React from "react";
import type { UniversityListProps } from "@/lib/types/university/list";
import { UniversityCard } from "./UniversityCard";
import { InsertUniversityButton } from "@/features/university/buttons/InsertButton";

export const UniversityList = ({
  universities,
  editMode,
  onEdit,
  onSave,
  onCancel,
  onScoreChange,
  onInfoChange,
  onInsert,
  onAddSubject,
  onSubjectNameChange,
}: UniversityListProps) => {
  const showInsertButtons = !editMode?.isEditing;

  // 大学データを安定的にソート
  const sortedUniversities = [...universities].sort((a, b) => {
    // 新規データの場合は指定されたindexの位置を維持
    if (editMode?.isNew && editMode.universityId === a.id) {
      return 0;
    }
    // それ以外は既存のID順でソート
    return a.id - b.id;
  });

  return (
    <div className="space-y-2">
      {showInsertButtons && (
        <InsertUniversityButton
          onInsert={onInsert}
          index={0}
          isOnly={sortedUniversities.length === 0}
        />
      )}
      {sortedUniversities.map((university, index) => (
        <React.Fragment key={`university-${university.id ?? index}`}>
          <UniversityCard
            university={university}
            editMode={editMode}
            onEdit={onEdit}
            onSave={onSave}
            onCancel={onCancel}
            onScoreChange={onScoreChange}
            onInfoChange={onInfoChange}
            onAddSubject={onAddSubject}
            onSubjectNameChange={onSubjectNameChange}
          />
          {showInsertButtons && (
            <InsertUniversityButton onInsert={onInsert} index={index + 1} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};
