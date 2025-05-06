import { describe, it, expect } from 'vitest';
import {
  transformAPIResponse,
  transformTestTypeToAPI,
  transformSubjectToAPI,
  transformSubjectFromAPI,
  transformTestTypeFromAPI,
} from './api-transformers';
import type { APITestType, APISubject, APIUniversity } from '@/types/api/types';
import type { TestType, Subject } from '@/features/admin/types/university';
import type { SubjectName } from '@/constants/constraint/subjects/subjects';
import type { ExamTypeName } from '@/constants/constraint/exam-types';

/**
 * APIトランスフォーマーのテスト
 *
 * このテストスイートでは、APIとフロントエンド間のデータ変換処理を検証します。
 *
 * @module api-transformers.test
 */

describe('APIトランスフォーマー', () => {
  describe('transformAPIResponse', () => {
    it('APIレスポンスを正しく変換できること', () => {
      const mockAPIResponse: APIUniversity[] = [
        {
          id: 1,
          name: 'テスト大学',
          departments: [],
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          version: 1,
          created_by: 'system',
          updated_by: 'system',
        },
      ];

      const result = transformAPIResponse(mockAPIResponse);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
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

    it('空の配列を正しく処理できること', () => {
      const result = transformAPIResponse([]);
      expect(result).toEqual([]);
    });

    it('nullやundefinedを含むデータを正しく処理できること', () => {
      const mockAPIResponse: APIUniversity[] = [
        {
          id: 1,
          name: 'テスト大学',
          departments: [],
          created_at: null,
          updated_at: undefined,
          version: 1,
          created_by: null,
          updated_by: undefined,
        },
      ];

      const result = transformAPIResponse(mockAPIResponse);
      expect(result[0].createdAt).toBeDefined();
      expect(result[0].updatedAt).toBeDefined();
      expect(result[0].createdBy).toBe('');
      expect(result[0].updatedBy).toBe('');
    });
  });

  describe('transformTestTypeToAPI', () => {
    it('テストタイプをAPI形式に正しく変換できること', () => {
      const mockTestType: TestType = {
        id: 1,
        admissionScheduleId: 1,
        name: '共通' as ExamTypeName,
        subjects: [],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        version: 1,
        createdBy: 'system',
        updatedBy: 'system',
      };

      const result = transformTestTypeToAPI(mockTestType);

      expect(result).toEqual({
        id: 1,
        admission_schedule_id: 1,
        name: '共通',
        subjects: [],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        deleted_at: null,
        version: 1,
        created_by: 'system',
        updated_by: 'system',
      });
    });

    it('nullやundefinedを含むデータを正しく処理できること', () => {
      const mockTestType: TestType = {
        id: 1,
        admissionScheduleId: 1,
        name: '共通' as ExamTypeName,
        subjects: [],
        createdAt: '',
        updatedAt: '',
        version: 1,
        createdBy: '',
        updatedBy: '',
      };

      const result = transformTestTypeToAPI(mockTestType);
      expect(result.deleted_at).toBeNull();
      expect(result.created_by).toBe('');
      expect(result.updated_by).toBe('');
    });
  });

  describe('transformSubjectToAPI', () => {
    it('科目情報をAPI形式に正しく変換できること', () => {
      const mockSubject: Subject = {
        id: 1,
        testTypeId: 1,
        name: '数学' as SubjectName,
        score: 100,
        percentage: 50,
        displayOrder: 1,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        version: 1,
        createdBy: 'system',
        updatedBy: 'system',
      };

      const result = transformSubjectToAPI(mockSubject);

      expect(result).toEqual({
        id: 1,
        test_type_id: 1,
        name: '数学',
        score: 100,
        percentage: 50,
        display_order: 1,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        deleted_at: null,
        version: 1,
        created_by: 'system',
        updated_by: 'system',
      });
    });

    it('数値が0の場合も正しく変換できること', () => {
      const mockSubject: Subject = {
        id: 1,
        testTypeId: 1,
        name: '数学' as SubjectName,
        score: 0,
        percentage: 0,
        displayOrder: 0,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        version: 1,
        createdBy: 'system',
        updatedBy: 'system',
      };

      const result = transformSubjectToAPI(mockSubject);
      expect(result.score).toBe(0);
      expect(result.percentage).toBe(0);
      expect(result.display_order).toBe(0);
    });
  });

  describe('transformSubjectFromAPI', () => {
    it('API形式の科目データを内部形式に正しく変換できること', () => {
      const mockAPISubject: APISubject = {
        id: 1,
        test_type_id: 1,
        name: '数学',
        score: 100,
        percentage: 50,
        display_order: 1,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        version: 1,
        created_by: 'system',
        updated_by: 'system',
      };

      const result = transformSubjectFromAPI(mockAPISubject);

      expect(result).toEqual({
        id: 1,
        testTypeId: 1,
        name: '数学',
        score: 100,
        percentage: 50,
        displayOrder: 0,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        version: 1,
        createdBy: 'system',
        updatedBy: 'system',
      });
    });

    it('nullやundefinedを含むデータを正しく処理できること', () => {
      const mockAPISubject: APISubject = {
        id: 1,
        test_type_id: 1,
        name: '数学',
        score: 100,
        percentage: 50,
        display_order: 1,
        created_at: null,
        updated_at: undefined,
        version: 1,
        created_by: null,
        updated_by: undefined,
      };

      const result = transformSubjectFromAPI(mockAPISubject);
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
      expect(result.createdBy).toBe('');
      expect(result.updatedBy).toBe('');
    });
  });

  describe('transformTestTypeFromAPI', () => {
    it('API形式のテストタイプデータを内部形式に正しく変換できること', () => {
      const mockAPITestType: APITestType = {
        id: 1,
        admission_schedule_id: 1,
        name: '共通',
        subjects: [],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        version: 1,
        created_by: 'system',
        updated_by: 'system',
      };

      const result = transformTestTypeFromAPI(mockAPITestType);

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
      const mockAPITestType: APITestType = {
        id: 1,
        admission_schedule_id: 1,
        name: '共通',
        subjects: [],
        created_at: null,
        updated_at: undefined,
        version: 1,
        created_by: null,
        updated_by: undefined,
      };

      const result = transformTestTypeFromAPI(mockAPITestType);
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
      expect(result.createdBy).toBe('');
      expect(result.updatedBy).toBe('');
    });
  });
});
