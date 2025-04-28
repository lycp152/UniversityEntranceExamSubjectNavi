import { useState, useCallback } from 'react';
import type {
  University,
  Department,
  Major,
  AdmissionSchedule,
  AdmissionInfo,
} from '@/features/admin/types/university';
import type { HttpError } from '@/types/api/types';
import {
  transformAPIResponse,
  transformToAPITestType,
} from '@/features/admin/utils/api-transformers';
import { API_ENDPOINTS } from '@/constants/api';

/**
 * 大学データの取得と更新機能を提供するカスタムフック
 *
 * @remarks
 * - APIを使用した大学データの取得と更新機能を提供
 * - エラーハンドリングとローディング状態の管理
 * - キャッシュ制御による効率的なデータ取得
 * - データの永続化と整合性の維持
 *
 * @returns {Object} 大学データ管理機能を提供するオブジェクト
 * @property {University[]} universities - 大学データの配列
 * @property {boolean} isLoading - ローディング状態
 * @property {string | null} error - エラーメッセージ
 * @property {Function} fetchUniversities - 大学データ取得関数
 * @property {Function} updateUniversity - 大学情報更新関数
 * @property {Function} updateDepartment - 学部情報更新関数
 * @property {Function} updateSubjects - 科目情報更新関数
 * @property {Function} updateMajor - 学科情報更新関数
 * @property {Function} updateAdmissionSchedule - 入試日程更新関数
 * @property {Function} updateAdmissionInfo - 入試情報更新関数
 */
export const useUniversityData = () => {
  const [universities, setUniversities] = useState<University[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleAPIError = useCallback((error: unknown): string => {
    console.error('APIエラー:', error);
    if (error instanceof Response) {
      return `APIエラー: ${error.status} ${error.statusText}`;
    }
    if (typeof error === 'object' && error !== null && 'message' in error) {
      return (error as HttpError).message;
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
      console.log('APIレスポンス:', data);

      const transformedData = transformAPIResponse(data);
      console.log('変換後のデータ:', transformedData);

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
        const apiDepartment = {
          id: department.id,
          name: department.name,
          university_id: university.id,
          created_at: department.createdAt,
          updated_at: department.updatedAt,
        };

        const response = await fetch(API_ENDPOINTS.DEPARTMENTS(university.id, department.id), {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...headers,
          },
          body: JSON.stringify(apiDepartment),
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
        const testTypes = department.majors[0]?.admissionSchedules[0]?.testTypes;
        if (!testTypes) {
          throw new Error('テストタイプが見つかりません');
        }

        const apiTestTypes = testTypes.map(transformToAPITestType);
        console.log('APIに送信するデータ:', {
          university_id: university.id,
          department_id: department.id,
          test_types: apiTestTypes,
        });

        const response = await fetch(API_ENDPOINTS.SUBJECTS_BATCH(university.id, department.id), {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...headers,
          },
          body: JSON.stringify({ test_types: apiTestTypes }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          console.error('APIエラーレスポンス:', {
            status: response.status,
            statusText: response.statusText,
            data: errorData,
          });
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

  const updateMajor = useCallback(
    async (departmentId: number, major: Major, headers: HeadersInit) => {
      try {
        const response = await fetch(API_ENDPOINTS.MAJOR(departmentId, major.id), {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...headers,
          },
          body: JSON.stringify(major),
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

  const updateAdmissionSchedule = useCallback(
    async (majorId: number, schedule: AdmissionSchedule, headers: HeadersInit) => {
      try {
        const response = await fetch(API_ENDPOINTS.ADMISSION_SCHEDULE(majorId, schedule.id), {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...headers,
          },
          body: JSON.stringify(schedule),
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

  const updateAdmissionInfo = useCallback(
    async (scheduleId: number, info: AdmissionInfo, headers: HeadersInit) => {
      try {
        const response = await fetch(API_ENDPOINTS.ADMISSION_INFO(scheduleId, info.id), {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...headers,
          },
          body: JSON.stringify(info),
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
    updateMajor,
    updateAdmissionSchedule,
    updateAdmissionInfo,
  };
};
