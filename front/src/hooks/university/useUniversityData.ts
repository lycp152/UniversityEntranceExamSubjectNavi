import { useState, useCallback } from "react";
import type { University, Department } from "@/lib/types/university/university";
import {
  transformAPIResponse,
  transformToAPITestType,
} from "@/lib/utils/university/transform";

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
    console.error("API Error:", error);
    if (error instanceof Response) {
      return `APIエラー: ${error.status} ${error.statusText}`;
    }
    if (typeof error === "object" && error !== null && "message" in error) {
      return (error as APIError).message;
    }
    return "予期せぬエラーが発生しました";
  }, []);

  const fetchUniversities = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(API_ENDPOINTS.UNIVERSITIES, {
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });

      if (!response.ok) {
        throw new Error(`APIエラー: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log("API Response:", data);

      const transformedData = transformAPIResponse(data);
      console.log("Transformed Data:", transformedData);

      setUniversities(transformedData);
      setError(null);
    } catch (error) {
      const errorMessage = handleAPIError(error);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [handleAPIError]);

  const updateUniversity = useCallback(
    async (university: University, headers: HeadersInit) => {
      try {
        const response = await fetch(
          `${API_ENDPOINTS.UNIVERSITIES}/${university.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              ...headers,
            },
            body: JSON.stringify(university),
          }
        );

        if (!response.ok) {
          throw new Error(
            `APIエラー: ${response.status} ${response.statusText}`
          );
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
    async (
      university: University,
      department: Department,
      headers: HeadersInit
    ) => {
      try {
        const apiDepartment = {
          id: department.id,
          name: department.name,
          university_id: university.id,
          created_at: department.createdAt.toISOString(),
          updated_at: department.updatedAt.toISOString(),
        };

        const response = await fetch(
          API_ENDPOINTS.DEPARTMENTS(university.id, department.id),
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              ...headers,
            },
            body: JSON.stringify(apiDepartment),
          }
        );

        if (!response.ok) {
          throw new Error(
            `APIエラー: ${response.status} ${response.statusText}`
          );
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
    async (
      university: University,
      department: Department,
      headers: HeadersInit
    ) => {
      try {
        const testTypes =
          department.majors[0]?.admissionSchedules[0]?.testTypes;
        if (!testTypes) {
          throw new Error("テストタイプが見つかりません");
        }

        const apiTestTypes = testTypes.map(transformToAPITestType);
        console.log("Sending data to API:", {
          university_id: university.id,
          department_id: department.id,
          test_types: apiTestTypes,
        });

        const response = await fetch(
          API_ENDPOINTS.SUBJECTS_BATCH(university.id, department.id),
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              ...headers,
            },
            body: JSON.stringify({ test_types: apiTestTypes }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          console.error("API Error Response:", {
            status: response.status,
            statusText: response.statusText,
            data: errorData,
          });
          throw new Error(
            `APIエラー: ${response.status} ${response.statusText}`
          );
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
