import type { Department, University } from "@/types/universities/university";

export interface DepartmentInfoProps {
  department: Department;
  university: University;
  isEditing: boolean;
  onInfoChange: (field: string, value: string | number) => void;
}
