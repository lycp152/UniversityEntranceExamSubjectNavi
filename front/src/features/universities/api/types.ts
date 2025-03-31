import type { University } from "@/types/universities/university";

export interface UniversityFilters {
  name?: string;
  departmentCount?: number;
  sortBy?: "name" | "departmentCount";
  sortOrder?: "asc" | "desc";
}

export interface UniversityListResponse {
  universities: University[];
  total: number;
}

export interface UniversityDetailResponse {
  university: University;
}

export interface UniversityQueryError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}
