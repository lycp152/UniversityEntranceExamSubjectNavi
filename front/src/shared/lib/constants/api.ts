export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const API_ENDPOINTS = {
  UNIVERSITIES: `${API_BASE_URL}/api/universities`,
  DEPARTMENTS: (universityId: number, departmentId: number) =>
    `${API_BASE_URL}/api/universities/${universityId}/departments/${departmentId}`,
  SUBJECTS_BATCH: (universityId: number, departmentId: number) =>
    `${API_BASE_URL}/api/universities/${universityId}/departments/${departmentId}/subjects/batch`,
} as const;

export type APIEndpoint = typeof API_ENDPOINTS;

export interface APIResponse<T> {
  data: T;
  meta?: {
    page?: number;
    per_page?: number;
    total?: number;
  };
}

export interface APIError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-cache',
  Pragma: 'no-cache',
} as const;
