import React from 'react';
import type { University, Department } from '@/lib/types/university/university';
import type { APITestType } from '@/lib/types/university/api';
import { DepartmentRow } from './DepartmentRow';

interface UniversityCardProps {
  readonly university: University;
  readonly editMode: {
    readonly universityId: number;
    readonly departmentId: number;
    readonly isEditing: boolean;
    readonly isNew?: boolean;
    readonly insertIndex?: number;
  } | null;
  readonly onEdit: (university: University, department: Department) => void;
  readonly onSave: (university: University, department: Department) => void;
  readonly onCancel: () => void;
  readonly onScoreChange: (
    universityId: number,
    departmentId: number,
    subjectId: number,
    value: number,
    isCommon: boolean
  ) => void;
  readonly onInfoChange: (
    universityId: number,
    departmentId: number,
    field: string,
    value: string | number
  ) => void;
  readonly onAddSubject: (universityId: number, departmentId: number, type: APITestType) => void;
  readonly onSubjectNameChange: (
    universityId: number,
    departmentId: number,
    subjectId: number,
    name: string
  ) => void;
}

export const UniversityCard = ({
  university,
  editMode,
  onEdit,
  onSave,
  onCancel,
  onScoreChange,
  onInfoChange,
  onAddSubject,
  onSubjectNameChange,
}: UniversityCardProps) => {
  return (
    <div className="bg-white shadow-sm rounded-xl overflow-hidden border border-gray-100">
      <div className="divide-y divide-gray-100">
        {university.departments?.map((department) => (
          <DepartmentRow
            key={`department-${university.id}-${department.id}`}
            university={university}
            department={department}
            isEditing={
              editMode?.universityId === university.id &&
              editMode?.departmentId === department.id &&
              editMode?.isEditing
            }
            onEdit={onEdit}
            onSave={onSave}
            onCancel={onCancel}
            onScoreChange={onScoreChange}
            onInfoChange={onInfoChange}
            onAddSubject={(type) => onAddSubject(university.id, department.id, type)}
            onSubjectNameChange={(subjectId, name) =>
              onSubjectNameChange(university.id, department.id, subjectId, name)
            }
          />
        ))}
      </div>
    </div>
  );
};
