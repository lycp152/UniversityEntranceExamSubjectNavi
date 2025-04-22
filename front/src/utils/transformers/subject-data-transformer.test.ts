/**
 * 科目データ変換のテスト
 * APIの科目データをUI表示用に変換する関数のテスト
 *
 * @module subject-data-transformer-test
 * @description
 * - 科目スコアの集計テスト
 * - テストタイプ別のスコア管理テスト
 * - UI表示用データの生成テスト
 */

import { describe, it, expect } from 'vitest';
import { transformSubjectData } from './subject-data-transformer';
import type {
  APISubject,
  APIUniversity,
  APIDepartment,
  APIMajor,
  APIAdmissionInfo,
  APIAdmissionSchedule,
  APITestType,
} from '@/types/api/types';

describe('科目データ変換のテスト', () => {
  const mockTestType: APITestType = {
    id: 1,
    name: '共通',
    admission_schedule_id: 1,
    subjects: [],
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    deleted_at: null,
    version: 1,
    created_by: 'test',
    updated_by: 'test',
  };

  const mockSchedule: APIAdmissionSchedule = {
    id: 1,
    name: '前期',
    display_order: 1,
    test_types: [mockTestType],
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    deleted_at: null,
    version: 1,
    created_by: 'test',
    updated_by: 'test',
  };

  const mockAdmissionInfo: APIAdmissionInfo = {
    id: 1,
    enrollment: 100,
    academic_year: '2024',
    status: 'active',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    deleted_at: null,
    version: 1,
    created_by: 'test',
    updated_by: 'test',
  };

  const mockUniversity: APIUniversity = {
    id: 1,
    name: 'テスト大学',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    deleted_at: null,
    version: 1,
    created_by: 'test',
    updated_by: 'test',
    departments: [],
  };

  const mockDepartment: APIDepartment = {
    id: 1,
    name: 'テスト学部',
    university_id: 1,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    deleted_at: null,
    version: 1,
    created_by: 'test',
    updated_by: 'test',
    majors: [],
  };

  const mockMajor: APIMajor = {
    id: 1,
    name: 'テスト専攻',
    department_id: 1,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    deleted_at: null,
    version: 1,
    created_by: 'test',
    updated_by: 'test',
    admission_schedules: [],
  };

  const mockSubject: APISubject = {
    id: 1,
    name: '数学',
    score: 80,
    percentage: 80,
    display_order: 1,
    test_type_id: 1,
    version: 1,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    deleted_at: null,
    created_by: 'test',
    updated_by: 'test',
  };

  describe('transformSubjectDataのテスト', () => {
    it('正常なデータ変換が行われること', () => {
      const result = transformSubjectData(
        mockSubject,
        [mockSubject],
        mockUniversity,
        mockDepartment,
        mockMajor,
        mockAdmissionInfo,
        mockSchedule
      );

      expect(result).not.toBeNull();
      expect(result?.id).toBe(mockSubject.id);
      expect(result?.name).toBe(mockSubject.name);
      expect(result?.score).toBe(mockSubject.score);
      expect(result?.percentage).toBe(mockSubject.percentage);
      expect(result?.university.name).toBe(mockUniversity.name);
      expect(result?.department.name).toBe(mockDepartment.name);
      expect(result?.major.name).toBe(mockMajor.name);
      expect(result?.subjects['数学'].commonTest).toBe(80);
    });

    it('必須パラメータが欠けている場合、nullを返すこと', () => {
      const result = transformSubjectData(
        { ...mockSubject, id: 0 },
        [mockSubject],
        mockUniversity,
        mockDepartment,
        mockMajor,
        mockAdmissionInfo,
        mockSchedule
      );

      expect(result).toBeNull();
    });

    it('複数の科目スコアが正しく集計されること', () => {
      const secondSubject: APISubject = {
        ...mockSubject,
        id: 2,
        name: '英語L',
        score: 70,
      };

      const result = transformSubjectData(
        mockSubject,
        [mockSubject, secondSubject],
        mockUniversity,
        mockDepartment,
        mockMajor,
        mockAdmissionInfo,
        mockSchedule
      );

      expect(result?.subjects['数学'].commonTest).toBe(80);
      expect(result?.subjects['英語L'].commonTest).toBe(70);
    });

    it('異なるテストタイプのスコアが正しく管理されること', () => {
      const secondTestType: APITestType = {
        ...mockTestType,
        id: 2,
        name: '二次',
      };

      const secondSchedule: APIAdmissionSchedule = {
        ...mockSchedule,
        test_types: [secondTestType],
      };

      const secondSubject: APISubject = {
        ...mockSubject,
        id: 2,
        test_type_id: 2,
      };

      const result = transformSubjectData(
        mockSubject,
        [mockSubject, secondSubject],
        mockUniversity,
        mockDepartment,
        mockMajor,
        mockAdmissionInfo,
        secondSchedule
      );

      expect(result?.subjects['数学'].commonTest).toBe(0);
      expect(result?.subjects['数学'].secondTest).toBe(80);
    });
  });
});
