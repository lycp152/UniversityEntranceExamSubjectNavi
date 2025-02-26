export const API_ENDPOINTS = {
  UNIVERSITIES: `${process.env.NEXT_PUBLIC_API_URL}/universities`,
  DEPARTMENTS: (universityId: number, departmentId: number) =>
    `${process.env.NEXT_PUBLIC_API_URL}/universities/${universityId}/departments/${departmentId}`,
  SUBJECTS_BATCH: (universityId: number, departmentId: number) =>
    `${process.env.NEXT_PUBLIC_API_URL}/universities/${universityId}/departments/${departmentId}/subjects/batch`,
} as const;
