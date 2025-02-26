"use client";

import { useEffect } from "react";
import type {
  Department,
  TestType,
  AdmissionSchedule,
} from "@/lib/types/university/university";
import { useUniversityEditor } from "@/lib/hooks/university/useUniversityEditor";
import { UniversityList } from "@/components/features/university/list/UniversityList";
import { AdminLayout } from "@/components/layout/admin/AdminLayout";
import { UniversityEditor } from "@/components/features/university/editor/UniversityEditor";
import { SubjectEditor } from "@/components/features/subject/editor/SubjectEditor";

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
      {editMode ? (
        <div>
          {universities.map((university) => {
            const department = university.departments.find(
              (d: Department) => d.id === editMode.departmentId
            );
            if (!department || university.id !== editMode.universityId)
              return null;

            return (
              <div key={university.id}>
                <UniversityEditor
                  university={university}
                  department={department}
                  onInfoChange={handleInfoChange}
                  onScoreChange={handleScoreChange}
                  onSave={async (u, d) => {
                    await handleSave(u, d);
                  }}
                  onCancel={handleCancel}
                  onAddSubject={handleAddSubject}
                  onSubjectNameChange={handleSubjectNameChange}
                />
                {department.majors[0]?.examInfos[0]?.admissionSchedules.map(
                  (schedule: AdmissionSchedule) =>
                    schedule.testTypes.map((testType: TestType) => (
                      <SubjectEditor
                        key={testType.id}
                        testType={testType}
                        onScoreChange={(subjectId, value, isCommon) =>
                          handleScoreChange(
                            university.id,
                            department.id,
                            subjectId,
                            value,
                            isCommon
                          )
                        }
                        onAddSubject={(type) =>
                          handleAddSubject(university.id, department.id, type)
                        }
                        onSubjectNameChange={(subjectId, name) =>
                          handleSubjectNameChange(
                            university.id,
                            department.id,
                            subjectId,
                            name
                          )
                        }
                      />
                    ))
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <UniversityList
          universities={universities}
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
      )}
    </AdminLayout>
  );
}
