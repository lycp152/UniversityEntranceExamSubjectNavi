import type { University, Department, TestType } from "./university";
import type { APITestType as TestTypeAPI } from "@/lib/types/university/api";

export interface EditMode {
  universityId: number;
  departmentId: number;
  isEditing: boolean;
  isNew?: boolean;
  insertIndex?: number;
}

export interface EditButtonsProps {
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
}

export interface DepartmentRowProps {
  university: University;
  department: Department;
  isEditing: boolean;
  onEdit: (university: University, department: Department) => void;
  onSave: (university: University, department: Department) => void;
  onCancel: () => void;
  onScoreChange: (
    universityId: number,
    departmentId: number,
    subjectId: number,
    value: number,
    isCommon: boolean
  ) => void;
  onInfoChange: (
    universityId: number,
    departmentId: number,
    field: string,
    value: string | number
  ) => void;
  onAddSubject: (type: TestTypeAPI) => void;
  onSubjectNameChange: (subjectId: number, name: string) => void;
}

export interface UniversityListProps {
  readonly universities: University[];
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
  readonly onInsert: (index: number) => void;
  readonly onAddSubject: (
    universityId: number,
    departmentId: number,
    type: TestTypeAPI
  ) => void;
  readonly onSubjectNameChange: (
    universityId: number,
    departmentId: number,
    subjectId: number,
    name: string
  ) => void;
}
