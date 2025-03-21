"use client";

import { useEffect } from "react";
import { useUniversityEditor } from "@/hooks/university/useUniversityEditor";
import { AdminPageContent } from "./AdminPageContent";
import { ErrorBoundary } from "@/components/errors/ErrorBoundary";

export function AdminPage(): JSX.Element {
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
    fetchUniversities().catch((error) => {
      console.error("Failed to fetch universities:", error);
    });
  }, [fetchUniversities]);

  return (
    <ErrorBoundary>
      <AdminPageContent
        universities={universities}
        error={error}
        isLoading={isLoading}
        successMessage={successMessage}
        editMode={editMode}
        onEdit={handleEdit}
        onInfoChange={handleInfoChange}
        onScoreChange={handleScoreChange}
        onSave={handleSave}
        onCancel={handleCancel}
        onInsert={handleInsert}
        onAddSubject={handleAddSubject}
        onSubjectNameChange={handleSubjectNameChange}
      />
    </ErrorBoundary>
  );
}
