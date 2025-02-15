'use client';

import { useState, useEffect } from 'react';
import { University, Department, Subject } from '@/types/models';
import { AdminHeader } from './AdminHeader';
import { ErrorMessage } from './ErrorMessage';
import { LoadingSpinner } from './LoadingSpinner';
import { EmptyState } from './EmptyState';
import { UniversityList } from './UniversityList';

const API_ENDPOINTS = {
  UNIVERSITIES: 'http://localhost:8080/api/universities',
  DEPARTMENTS: (universityId: number, departmentId: number) =>
    `http://localhost:8080/api/universities/${universityId}/departments/${departmentId}`,
  SUBJECTS_BATCH: (universityId: number, departmentId: number) =>
    `http://localhost:8080/api/universities/${universityId}/departments/${departmentId}/subjects/batch`,
} as const;

export function AdminPage() {
  const [universities, setUniversities] = useState<University[]>([]);
  const [editMode, setEditMode] = useState<{
    universityId: number;
    departmentId: number;
    isEditing: boolean;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchUniversities();
  }, []);

  const fetchUniversities = async () => {
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
        throw new Error('データベースに接続できません。');
      }
      const data = await response.json();
      setUniversities(data);
    } catch (error) {
      console.error('Failed to fetch universities:', error);
      setError('データベースに接続できません。サーバーが起動しているか確認してください。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (university: University, department: Department) => {
    setEditMode({
      universityId: university.ID,
      departmentId: department.ID,
      isEditing: true,
    });
  };

  const updateDepartmentField = (department: Department, field: string, value: string | number) => {
    switch (field) {
      case 'departmentName':
        return { ...department, name: value as string };
      case 'major':
        return { ...department, major: value as string };
      case 'schedule':
        return { ...department, schedule: value as string };
      case 'enrollment':
        return { ...department, enrollment: value as number };
      default:
        return department;
    }
  };

  const handleInfoChange = (
    universityId: number,
    departmentId: number,
    field: string,
    value: string | number
  ) => {
    setUniversities((prevUniversities) =>
      prevUniversities.map((university) => {
        if (university.ID !== universityId) return university;

        if (field === 'universityName') {
          return { ...university, name: value as string };
        }

        return {
          ...university,
          departments: university.departments?.map((department) =>
            department.ID !== departmentId
              ? department
              : updateDepartmentField(department, field, value)
          ),
        };
      })
    );
  };

  const calculateUpdatedSubjects = (
    subjects: Subject[] | undefined,
    subjectId: number,
    value: number,
    isCommon: boolean
  ) => {
    if (!subjects) return [];

    let totalScore = 0;
    const updatedSubjects = subjects.map((subject) => {
      const updatedSubject = {
        ...subject,
        test_scores: subject.test_scores.map((ts) => {
          if (
            subject.ID === subjectId &&
            ((isCommon && ts.test_type === '共通') || (!isCommon && ts.test_type === '二次'))
          ) {
            return { ...ts, score: value };
          }
          return ts;
        }),
      };
      totalScore += updatedSubject.test_scores.reduce((sum, ts) => sum + ts.score, 0);
      return updatedSubject;
    });

    return updatedSubjects.map((subject) => ({
      ...subject,
      test_scores: subject.test_scores.map((ts) => ({
        ...ts,
        percentage: totalScore > 0 ? (ts.score / totalScore) * 100 : 0,
      })),
    }));
  };

  const updateDepartmentSubjects = (
    department: Department,
    subjectId: number,
    value: number,
    isCommon: boolean
  ) => {
    const examInfo = department.majors[0]?.exam_infos[0];
    if (!examInfo) return department;

    const updatedSubjects = calculateUpdatedSubjects(examInfo.subjects, subjectId, value, isCommon);

    return {
      ...department,
      majors: [
        {
          ...department.majors[0],
          exam_infos: [
            {
              ...examInfo,
              subjects: updatedSubjects,
            },
          ],
        },
      ],
    };
  };

  const handleScoreChange = async (
    universityId: number,
    departmentId: number,
    subjectId: number,
    value: number,
    isCommon: boolean
  ) => {
    try {
      setUniversities((prevUniversities) =>
        prevUniversities.map((university) =>
          university.ID !== universityId
            ? university
            : {
                ...university,
                departments: university.departments?.map((department) =>
                  department.ID !== departmentId
                    ? department
                    : updateDepartmentSubjects(department, subjectId, value, isCommon)
                ),
              }
        )
      );
    } catch (error) {
      console.error('Error updating score:', error);
      setError('点数の更新に失敗しました。');
    }
  };

  const fetchUpdatedData = async (headers: HeadersInit) => {
    const response = await fetch(API_ENDPOINTS.UNIVERSITIES, {
      headers,
    });

    if (!response.ok) {
      throw new Error('データの再取得に失敗しました。');
    }

    return await response.json();
  };

  const updateUniversity = async (university: University, headers: HeadersInit) => {
    const response = await fetch(`${API_ENDPOINTS.UNIVERSITIES}/${university.ID}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        name: university.name,
        ID: university.ID,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`大学情報の更新に失敗: ${errorData.error || response.statusText}`);
    }
  };

  const updateDepartment = async (
    university: University,
    department: Department,
    headers: HeadersInit
  ) => {
    const response = await fetch(API_ENDPOINTS.DEPARTMENTS(university.ID, department.ID), {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        name: department.name,
        ID: department.ID,
        university_id: department.university_id,
        description: department.description,
        website: department.website,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`学部情報の更新に失敗: ${errorData.error || response.statusText}`);
    }
  };

  const updateSubjects = async (
    university: University,
    department: Department,
    headers: HeadersInit
  ) => {
    const examInfo = department.majors[0]?.exam_infos[0];
    if (!examInfo?.subjects) return;

    const subjectUpdates = examInfo.subjects.map((subject: Subject) => ({
      ID: subject.ID,
      exam_info_id: subject.exam_info_id,
      name: subject.name,
      display_order: subject.display_order,
      test_scores: subject.test_scores,
    }));

    const response = await fetch(API_ENDPOINTS.SUBJECTS_BATCH(university.ID, department.ID), {
      method: 'PUT',
      headers,
      body: JSON.stringify(subjectUpdates),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`科目情報の更新に失敗: ${errorData.error || response.statusText}`);
    }
  };

  const handleSave = async (university: University, department: Department) => {
    try {
      setIsLoading(true);
      setError(null);

      const headers = {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
      };

      await updateUniversity(university, headers);
      await updateDepartment(university, department, headers);
      await updateSubjects(university, department, headers);

      await new Promise((resolve) => setTimeout(resolve, 100));
      const updatedData = await fetchUpdatedData(headers);

      setUniversities(updatedData);
      setEditMode(null);
      setSuccessMessage('データが正常に更新されました');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Error updating data:', error);
      setError(error instanceof Error ? error.message : 'データの更新に失敗しました。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditMode(null);
    fetchUniversities();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <AdminHeader
          editMode={editMode}
          onAddNew={() => setEditMode({ universityId: 0, departmentId: 0, isEditing: true })}
        />
        {error && <ErrorMessage message={error} />}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-green-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-sm text-green-600">{successMessage}</p>
            </div>
          </div>
        )}
        {isLoading && <LoadingSpinner />}
        {!isLoading && !error && universities.length === 0 && <EmptyState />}
        {!isLoading && !error && universities.length > 0 && (
          <UniversityList
            universities={universities}
            editMode={editMode}
            onEdit={handleEdit}
            onSave={handleSave}
            onCancel={handleCancel}
            onScoreChange={handleScoreChange}
            onInfoChange={handleInfoChange}
          />
        )}
      </div>
    </div>
  );
}
