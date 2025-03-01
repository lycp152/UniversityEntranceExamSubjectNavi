"use client";

import { useEffect } from "react";
import type { APITestType } from "@/lib/types/university/api";
import { useUniversityEditor } from "@/lib/hooks/university/useUniversityEditor";
import { UniversityList } from "@/components/features/university/list/UniversityList";
import { AdminLayout } from "@/components/layout/admin/AdminLayout";

export function AdminPage() {
  const {
    universities,
    error,
    isLoading,
    successMessage,
    fetchUniversities,
    editMode,
    handleEdit,
    handleCancel,
    handleSave,
    handleInfoChange,
    handleScoreChange,
    handleAddSubject,
    handleSubjectNameChange,
    handleInsert,
  } = useUniversityEditor();

  useEffect(() => {
    fetchUniversities();
  }, [fetchUniversities]);

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
        onEdit={handleEdit}
        onInfoChange={handleInfoChange}
        onScoreChange={handleScoreChange}
        onSave={handleSave}
        onCancel={handleCancel}
        onInsert={handleInsert}
        onAddSubject={(
          universityId: number,
          departmentId: number,
          type: APITestType
        ) => handleAddSubject(universityId, departmentId, type)}
        onSubjectNameChange={handleSubjectNameChange}
      />
    </AdminLayout>
  );
}
