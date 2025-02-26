import { useState, useCallback } from 'react';
import type { University, Department } from '@/lib/types/university/university';

const API_ENDPOINTS = {
  UNIVERSITIES: `${process.env.NEXT_PUBLIC_API_URL}/universities`,
  DEPARTMENTS: (universityId: number, departmentId: number) =>
    `${process.env.NEXT_PUBLIC_API_URL}/universities/${universityId}/departments/${departmentId}`,
  SUBJECTS_BATCH: (universityId: number, departmentId: number) =>
    `${process.env.NEXT_PUBLIC_API_URL}/universities/${universityId}/departments/${departmentId}/subjects/batch`,
} as const;

interface APIError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export const useUniversityData = () => {
  const [universities, setUniversities] = useState<University[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleAPIError = useCallback((error: unknown): string => {
    console.error('API Error:', error);
    if (error instanceof Response) {
      return `APIエラー: ${error.status} ${error.statusText}`;
    }
    if (typeof error === 'object' && error !== null && 'message' in error) {
      return (error as APIError).message;
    }
    return '予期せぬエラーが発生しました';
  }, []);

  const fetchUniversities = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(API_ENDPOINTS.UNIVERSITIES, {
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
        },
      });

      if (!response.ok) {
        throw new Error(`APIエラー: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setUniversities(data);
      return data;
    } catch (error) {
      const errorMessage = handleAPIError(error);
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [handleAPIError]);

  const updateUniversity = useCallback(
    async (university: University, headers: HeadersInit) => {
      try {
        const response = await fetch(`${API_ENDPOINTS.UNIVERSITIES}/${university.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...headers,
          },
          body: JSON.stringify(university),
        });

        if (!response.ok) {
          throw new Error(`APIエラー: ${response.status} ${response.statusText}`);
        }

        return await response.json();
      } catch (error) {
        const errorMessage = handleAPIError(error);
        setError(errorMessage);
        throw error;
      }
    },
    [handleAPIError]
  );

  const updateDepartment = useCallback(
    async (university: University, department: Department, headers: HeadersInit) => {
      try {
        const response = await fetch(API_ENDPOINTS.DEPARTMENTS(university.id, department.id), {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...headers,
          },
          body: JSON.stringify(department),
        });

        if (!response.ok) {
          throw new Error(`APIエラー: ${response.status} ${response.statusText}`);
        }

        return await response.json();
      } catch (error) {
        const errorMessage = handleAPIError(error);
        setError(errorMessage);
        throw error;
      }
    },
    [handleAPIError]
  );

  const updateSubjects = useCallback(
    async (university: University, department: Department, headers: HeadersInit) => {
      try {
        const testTypes = department.majors[0]?.examInfos[0]?.admissionSchedules[0]?.testTypes;
        if (!testTypes) {
          throw new Error('テストタイプが見つかりません');
        }

        const response = await fetch(API_ENDPOINTS.SUBJECTS_BATCH(university.id, department.id), {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...headers,
          },
          body: JSON.stringify({ test_types: testTypes }),
        });

        if (!response.ok) {
          throw new Error(`APIエラー: ${response.status} ${response.statusText}`);
        }

        return await response.json();
      } catch (error) {
        const errorMessage = handleAPIError(error);
        setError(errorMessage);
        throw error;
      }
    },
    [handleAPIError]
  );

  return {
    universities,
    setUniversities,
    error,
    setError,
    isLoading,
    setIsLoading,
    successMessage,
    setSuccessMessage,
    fetchUniversities,
    updateUniversity,
    updateDepartment,
    updateSubjects,
  };
};
