import { describe, it, expect } from 'vitest';
import {
  transformUniversity,
  transformDepartment,
  transformMajor,
  transformAdmissionInfo,
  transformAdmissionSchedule,
  transformTestType,
  transformSubject,
  validateStatusTransition,
} from './university-data-transformer';
import type {
  APIUniversity,
  APIDepartment,
  APIMajor,
  APIAdmissionSchedule,
  APIAdmissionInfo,
  APITestType,
  APISubject,
} from '@/types/api/types';
import type { SubjectName } from '@/constants/constraint/subjects/subjects';
import type { ExamTypeName } from '@/constants/constraint/exam-types';
import type { AdmissionScheduleName } from '@/constants/constraint/admission-schedule';

/**
 * 大学データ変換ユーティリティのテスト
 *
 * このテストスイートでは、大学データの変換処理を検証します。
 *
 * @module university-data-transformer.test
 */

describe('大学データ変換ユーティリティ', () => {
  const mockAPIUniversity: APIUniversity = {
    id: 1,
    name: 'テスト大学',
    departments: [],
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    version: 1,
    created_by: 'system',
    updated_by: 'system',
  };

  const mockAPIDepartment: APIDepartment = {
    id: 1,
    name: '理学部',
    university_id: 1,
    majors: [],
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    version: 1,
    created_by: 'system',
    updated_by: 'system',
  };

  const mockAPIMajor: APIMajor = {
    id: 1,
    name: '数学科',
    department_id: 1,
    admission_schedules: [],
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    version: 1,
    created_by: 'system',
    updated_by: 'system',
  };

  const mockAPIAdmissionSchedule: APIAdmissionSchedule = {
    id: 1,
    major_id: 1,
    name: '前' as AdmissionScheduleName,
    display_order: 0,
    test_types: [],
    admission_infos: [],
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    version: 1,
    created_by: 'system',
    updated_by: 'system',
  };

  const mockAPIAdmissionInfo: APIAdmissionInfo = {
    id: 1,
    admission_schedule_id: 1,
    academic_year: 2024,
    enrollment: 100,
    status: 'draft',
    test_types: [],
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    version: 1,
    created_by: 'system',
    updated_by: 'system',
  };

  const mockAPITestType: APITestType = {
    id: 1,
    admission_schedule_id: 1,
    name: '共通' as ExamTypeName,
    subjects: [],
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    version: 1,
    created_by: 'system',
    updated_by: 'system',
  };

  const mockAPISubject: APISubject = {
    id: 1,
    test_type_id: 1,
    name: '数学' as SubjectName,
    score: 100,
    percentage: 50,
    display_order: 1,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    version: 1,
    created_by: 'system',
    updated_by: 'system',
  };

  describe('transformUniversity', () => {
    it('大学データを正しく変換できること', () => {
      const result = transformUniversity(mockAPIUniversity);
      expect(result).toEqual({
        id: 1,
        name: 'テスト大学',
        departments: [],
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        version: 1,
        createdBy: 'system',
        updatedBy: 'system',
      });
    });

    it('nullやundefinedを含むデータを正しく処理できること', () => {
      const universityWithNulls: APIUniversity = {
        ...mockAPIUniversity,
        created_at: null,
        updated_at: undefined,
        created_by: null,
        updated_by: undefined,
      };

      const result = transformUniversity(universityWithNulls);
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
      expect(result.createdBy).toBe('');
      expect(result.updatedBy).toBe('');
    });
  });

  describe('transformDepartment', () => {
    it('学部データを正しく変換できること', () => {
      const result = transformDepartment(mockAPIDepartment);
      expect(result).toEqual({
        id: 1,
        name: '理学部',
        universityId: 1,
        majors: [],
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        version: 1,
        createdBy: 'system',
        updatedBy: 'system',
      });
    });

    it('nullやundefinedを含むデータを正しく処理できること', () => {
      const departmentWithNulls: APIDepartment = {
        ...mockAPIDepartment,
        created_at: null,
        updated_at: undefined,
        created_by: null,
        updated_by: undefined,
      };

      const result = transformDepartment(departmentWithNulls);
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
      expect(result.createdBy).toBe('');
      expect(result.updatedBy).toBe('');
    });
  });

  describe('transformMajor', () => {
    it('学科データを正しく変換できること', () => {
      const result = transformMajor(mockAPIMajor);
      expect(result).toEqual({
        id: 1,
        name: '数学科',
        departmentId: 1,
        admissionSchedules: [],
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        version: 1,
        createdBy: 'system',
        updatedBy: 'system',
      });
    });

    it('nullやundefinedを含むデータを正しく処理できること', () => {
      const majorWithNulls: APIMajor = {
        ...mockAPIMajor,
        created_at: null,
        updated_at: undefined,
        created_by: null,
        updated_by: undefined,
      };

      const result = transformMajor(majorWithNulls);
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
      expect(result.createdBy).toBe('');
      expect(result.updatedBy).toBe('');
    });
  });

  describe('transformAdmissionInfo', () => {
    it('入試情報を正しく変換できること', () => {
      const result = transformAdmissionInfo(mockAPIAdmissionInfo);
      expect(result).toEqual({
        id: 1,
        admissionScheduleId: 1,
        academicYear: 2024,
        enrollment: 100,
        status: 'draft',
        testTypes: [],
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        version: 1,
        createdBy: 'system',
        updatedBy: 'system',
      });
    });

    it('nullやundefinedを含むデータを正しく処理できること', () => {
      const infoWithNulls: APIAdmissionInfo = {
        ...mockAPIAdmissionInfo,
        created_at: null,
        updated_at: undefined,
        created_by: null,
        updated_by: undefined,
      };

      const result = transformAdmissionInfo(infoWithNulls);
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
      expect(result.createdBy).toBe('');
      expect(result.updatedBy).toBe('');
    });
  });

  describe('transformAdmissionSchedule', () => {
    it('入試日程を正しく変換できること', () => {
      const result = transformAdmissionSchedule(mockAPIAdmissionSchedule);
      expect(result).toEqual({
        id: 1,
        majorId: 1,
        name: '前',
        displayOrder: 0,
        testTypes: [],
        admissionInfos: [],
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        version: 1,
        createdBy: 'system',
        updatedBy: 'system',
      });
    });

    it('nullやundefinedを含むデータを正しく処理できること', () => {
      const scheduleWithNulls: APIAdmissionSchedule = {
        ...mockAPIAdmissionSchedule,
        created_at: null,
        updated_at: undefined,
        created_by: null,
        updated_by: undefined,
      };

      const result = transformAdmissionSchedule(scheduleWithNulls);
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
      expect(result.createdBy).toBe('');
      expect(result.updatedBy).toBe('');
    });
  });

  describe('transformTestType', () => {
    it('テストタイプを正しく変換できること', () => {
      const result = transformTestType(mockAPITestType);
      expect(result).toEqual({
        id: 1,
        admissionScheduleId: 1,
        name: '共通',
        subjects: [],
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        version: 1,
        createdBy: 'system',
        updatedBy: 'system',
      });
    });

    it('nullやundefinedを含むデータを正しく処理できること', () => {
      const testTypeWithNulls: APITestType = {
        ...mockAPITestType,
        created_at: null,
        updated_at: undefined,
        created_by: null,
        updated_by: undefined,
      };

      const result = transformTestType(testTypeWithNulls);
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
      expect(result.createdBy).toBe('');
      expect(result.updatedBy).toBe('');
    });
  });

  describe('transformSubject', () => {
    it('科目データを正しく変換できること', () => {
      const result = transformSubject(mockAPISubject);
      expect(result).toEqual({
        id: 1,
        testTypeId: 1,
        name: '数学',
        score: 100,
        percentage: 50,
        displayOrder: 1,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        version: 1,
        createdBy: 'system',
        updatedBy: 'system',
      });
    });

    it('nullやundefinedを含むデータを正しく処理できること', () => {
      const subjectWithNulls: APISubject = {
        ...mockAPISubject,
        created_at: null,
        updated_at: undefined,
        created_by: null,
        updated_by: undefined,
      };

      const result = transformSubject(subjectWithNulls);
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
      expect(result.createdBy).toBe('');
      expect(result.updatedBy).toBe('');
    });
  });

  describe('validateStatusTransition', () => {
    it('有効なステータス遷移を検証できること', () => {
      expect(validateStatusTransition('draft', 'published')).toBe(true);
    });

    it('無効なステータス遷移を検証できること', () => {
      expect(validateStatusTransition('published', 'draft')).toBe(false);
    });
  });
});
