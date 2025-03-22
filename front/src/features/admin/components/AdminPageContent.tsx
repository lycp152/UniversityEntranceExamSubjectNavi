"use client";

import type { APITestType } from "@/types/api/api-types";
import type { University, Department } from "@/types/university/university";
import type { EditMode } from "@/types/university/university-list";
import { UniversityList } from "@/features/universities/list/UniversityList";
import { AdminLayout } from "@/features/admin/components/AdminLayout";
import { memo, useCallback } from "react";

interface AdminPageContentProps {
  readonly universities: University[];
  readonly error: string | null;
  readonly isLoading: boolean;
  readonly successMessage: string | null;
  readonly editMode: EditMode | null;
  readonly onEdit: (university: University, department: Department) => void;
  readonly onInfoChange: (
    universityId: number,
    departmentId: number,
    field: string,
    value: string | number
  ) => void;
  readonly onScoreChange: (
    universityId: number,
    departmentId: number,
    subjectId: number,
    value: number,
    isCommon: boolean
  ) => Promise<void>;
  readonly onSave: (
    university: University,
    department: Department
  ) => Promise<(() => void) | undefined>;
  readonly onCancel: () => void;
  readonly onInsert: (index: number) => void;
  readonly onAddSubject: (
    universityId: number,
    departmentId: number,
    type: APITestType
  ) => void;
  readonly onSubjectNameChange: (
    universityId: number,
    departmentId: number,
    subjectId: number,
    name: string
  ) => void;
}

export const AdminPageContent = memo(function AdminPageContent({
  universities,
  error,
  isLoading,
  successMessage,
  editMode,
  onEdit,
  onInfoChange,
  onScoreChange,
  onSave,
  onCancel,
  onInsert,
  onAddSubject,
  onSubjectNameChange,
}: AdminPageContentProps): JSX.Element {
  const handleEditCallback = useCallback(
    (university: University, department: Department) => {
      onEdit(university, department);
    },
    [onEdit]
  );

  const handleInfoChangeCallback = useCallback(
    (
      universityId: number,
      departmentId: number,
      field: string,
      value: string | number
    ) => {
      onInfoChange(universityId, departmentId, field, value);
    },
    [onInfoChange]
  );

  return (
    <AdminLayout
      isLoading={isLoading}
      error={error}
      isEmpty={!universities.length}
      successMessage={successMessage}
    >
      <UniversityList
        universities={universities}
        editMode={editMode}
        onEdit={handleEditCallback}
        onInfoChange={handleInfoChangeCallback}
        onScoreChange={onScoreChange}
        onSave={onSave}
        onCancel={onCancel}
        onInsert={onInsert}
        onAddSubject={onAddSubject}
        onSubjectNameChange={onSubjectNameChange}
      />
    </AdminLayout>
  );
});
