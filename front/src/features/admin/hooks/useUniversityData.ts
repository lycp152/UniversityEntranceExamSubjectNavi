import { useState, useCallback } from "react";
import type {
  University,
  Department,
  Major,
  AdmissionSchedule,
  AdmissionInfo,
} from "@/types/universities/university";
import type { HttpError } from "@/types/api/http";
import {
  transformAPIResponse,
  transformToAPITestType,
} from "@/utils/transformers/university-data-transformer";

const API_ENDPOINTS = {
  UNIVERSITIES: `${process.env.NEXT_PUBLIC_API_URL}/universities`,
  DEPARTMENTS: (universityId: number, departmentId: number) =>
    `${process.env.NEXT_PUBLIC_API_URL}/universities/${universityId}/departments/${departmentId}`,
  SUBJECTS_BATCH: (universityId: number, departmentId: number) =>
    `${process.env.NEXT_PUBLIC_API_URL}/universities/${universityId}/departments/${departmentId}/subjects/batch`,
  MAJOR: (departmentId: number, majorId: number) =>
    `${process.env.NEXT_PUBLIC_API_URL}/departments/${departmentId}/majors/${majorId}`,
  ADMISSION_SCHEDULE: (majorId: number, scheduleId: number) =>
    `${process.env.NEXT_PUBLIC_API_URL}/majors/${majorId}/schedules/${scheduleId}`,
  ADMISSION_INFO: (scheduleId: number, infoId: number) =>
    `${process.env.NEXT_PUBLIC_API_URL}/schedules/${scheduleId}/info/${infoId}`,
} as const;

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
      return (error as HttpError).message;
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
          created_at: department.createdAt,
          updated_at: department.updatedAt,
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

  const updateMajor = useCallback(
    async (departmentId: number, major: Major, headers: HeadersInit) => {
      try {
        const response = await fetch(
          API_ENDPOINTS.MAJOR(departmentId, major.id),
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              ...headers,
            },
            body: JSON.stringify(major),
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

  const updateAdmissionSchedule = useCallback(
    async (
      majorId: number,
      schedule: AdmissionSchedule,
      headers: HeadersInit
    ) => {
      try {
        const response = await fetch(
          API_ENDPOINTS.ADMISSION_SCHEDULE(majorId, schedule.id),
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              ...headers,
            },
            body: JSON.stringify(schedule),
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

  const updateAdmissionInfo = useCallback(
    async (scheduleId: number, info: AdmissionInfo, headers: HeadersInit) => {
      try {
        const response = await fetch(
          API_ENDPOINTS.ADMISSION_INFO(scheduleId, info.id),
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              ...headers,
            },
            body: JSON.stringify(info),
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
    updateMajor,
    updateAdmissionSchedule,
    updateAdmissionInfo,
  };
};
