import { describe, it, expect } from 'vitest';
import {
  updateDepartmentField,
  updateDepartmentInUniversity,
  validateDepartmentUpdate,
} from './department-updaters';
import type { Department, University } from '@/features/admin/types/university';
import type { AdmissionScheduleName } from '@/constants/constraint/admission-schedule';

/**
 * 部門更新ユーティリティのテスト
 *
 * このテストスイートでは、部門データの更新処理を検証します。
 *
 * @module department-updaters.test
 */

describe('部門更新ユーティリティ', () => {
  const mockDepartment: Department = {
    id: 1,
    name: '理学部',
    universityId: 1,
    version: 1,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    createdBy: 'system',
    updatedBy: 'system',
    majors: [
      {
        id: 1,
        name: '数学科',
        departmentId: 1,
        version: 1,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        createdBy: 'system',
        updatedBy: 'system',
        admissionSchedules: [
          {
            id: 1,
            name: '前' as AdmissionScheduleName,
            majorId: 1,
            displayOrder: 0,
            version: 1,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
            createdBy: 'system',
            updatedBy: 'system',
            testTypes: [],
            admissionInfos: [
              {
                id: 1,
                admissionScheduleId: 1,
                academicYear: 2024,
                enrollment: 100,
                status: 'draft',
                version: 1,
                createdAt: '2024-01-01T00:00:00Z',
                updatedAt: '2024-01-01T00:00:00Z',
                createdBy: 'system',
                updatedBy: 'system',
                testTypes: [],
              },
            ],
          },
        ],
      },
    ],
  };

  const mockUniversity: University = {
    id: 1,
    name: '東京大学',
    version: 1,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    createdBy: 'system',
    updatedBy: 'system',
    departments: [mockDepartment],
  };

  describe('updateDepartmentField', () => {
    it('部門名を正しく更新できること', () => {
      const result = updateDepartmentField(mockDepartment, 'departmentName', '理学部（更新）');
      expect(result.name).toBe('理学部（更新）');
    });

    it('学科名を正しく更新できること', () => {
      const result = updateDepartmentField(mockDepartment, 'majorName', '数学科（更新）');
      expect(result.majors[0].name).toBe('数学科（更新）');
    });

    it('定員を正しく更新できること', () => {
      const result = updateDepartmentField(mockDepartment, 'enrollment', 150);
      expect(result.majors[0].admissionSchedules[0].admissionInfos[0].enrollment).toBe(150);
    });

    it('入試日程を正しく更新できること', () => {
      const result = updateDepartmentField(
        mockDepartment,
        'schedule',
        '後' as AdmissionScheduleName
      );
      expect(result.majors[0].admissionSchedules[0].name).toBe('後');
    });

    it('無効なフィールドの場合は更新しないこと', () => {
      const result = updateDepartmentField(mockDepartment, 'invalidField', 'value');
      expect(result).toEqual(mockDepartment);
    });
  });

  describe('updateDepartmentInUniversity', () => {
    it('大学名を正しく更新できること', () => {
      const result = updateDepartmentInUniversity(
        mockUniversity,
        1,
        'universityName',
        '東京大学（更新）'
      );
      expect(result.name).toBe('東京大学（更新）');
    });

    it('部門情報を正しく更新できること', () => {
      const result = updateDepartmentInUniversity(
        mockUniversity,
        1,
        'departmentName',
        '理学部（更新）'
      );
      expect(result.departments[0].name).toBe('理学部（更新）');
    });

    it('存在しない部門IDの場合は更新しないこと', () => {
      const result = updateDepartmentInUniversity(
        mockUniversity,
        999,
        'departmentName',
        '理学部（更新）'
      );
      expect(result).toEqual(mockUniversity);
    });
  });

  describe('validateDepartmentUpdate', () => {
    it('有効な部門名を検証できること', () => {
      expect(validateDepartmentUpdate(mockDepartment, 'departmentName', '理学部（更新）')).toBe(
        true
      );
    });

    it('無効な部門名を検証できること', () => {
      expect(validateDepartmentUpdate(mockDepartment, 'departmentName', '')).toBe(false);
    });

    it('有効な学科名を検証できること', () => {
      expect(validateDepartmentUpdate(mockDepartment, 'majorName', '数学科（更新）')).toBe(true);
    });

    it('無効な学科名を検証できること', () => {
      expect(validateDepartmentUpdate(mockDepartment, 'majorName', '')).toBe(false);
    });

    it('有効な定員を検証できること', () => {
      expect(validateDepartmentUpdate(mockDepartment, 'enrollment', 150)).toBe(true);
    });

    it('無効な定員を検証できること', () => {
      expect(validateDepartmentUpdate(mockDepartment, 'enrollment', -1)).toBe(false);
    });

    it('有効な入試日程を検証できること', () => {
      expect(
        validateDepartmentUpdate(mockDepartment, 'schedule', '後' as AdmissionScheduleName)
      ).toBe(true);
    });

    it('無効な入試日程を検証できること', () => {
      expect(
        validateDepartmentUpdate(mockDepartment, 'schedule', '無効' as AdmissionScheduleName)
      ).toBe(false);
    });
  });
});
