import type { University, Department } from "@/types/university/university";

export interface UniversityCardProps {
  university: University;
}

export interface DepartmentCardProps {
  department: Department;
}

export interface UniversityOperationError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface UniversityOperationResult<T> {
  data?: T;
  error?: UniversityOperationError;
}
