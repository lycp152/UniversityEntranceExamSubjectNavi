import { describe, it, expect } from 'vitest';
import {
  updateTestTypesWithNewSubject,
  updateTestTypesWithSubjectName,
} from './test-type-updaters';
import type { TestType, Subject, AdmissionSchedule } from '@/features/admin/types/university';
import type { SubjectName } from '@/constants/constraint/subjects/subjects';

/**
 * テストタイプ更新ユーティリティのテスト
 *
 * このテストスイートでは、テストタイプの更新処理を検証します。
 *
 * @module test-type-updaters.test
 */

describe('テストタイプ更新ユーティリティ', () => {
  const mockTestType: TestType = {
    id: 1,
    admissionScheduleId: 1,
    name: '共通',
    subjects: [],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    version: 1,
    createdBy: 'system',
    updatedBy: 'system',
  };

  const mockAdmissionSchedule: AdmissionSchedule = {
    id: 1,
    majorId: 1,
    name: '前',
    displayOrder: 0,
    testTypes: [mockTestType],
    admissionInfos: [],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    version: 1,
    createdBy: 'system',
    updatedBy: 'system',
  };

  describe('updateTestTypesWithNewSubject', () => {
    it('新しい科目を正しく追加できること', () => {
      const newSubject: Subject = {
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

      const result = updateTestTypesWithNewSubject(mockAdmissionSchedule, mockTestType, newSubject);

      expect(result.testTypes[0].subjects).toHaveLength(1);
      expect(result.testTypes[0].subjects[0]).toEqual(newSubject);
    });

    it('存在しないテストタイプの場合は更新しないこと', () => {
      const nonExistentTestType: TestType = {
        ...mockTestType,
        id: 999,
      };

      const result = updateTestTypesWithNewSubject(mockAdmissionSchedule, nonExistentTestType, {
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
      });

      expect(result).toEqual(mockAdmissionSchedule);
    });
  });

  describe('updateTestTypesWithSubjectName', () => {
    it('科目名を正しく更新できること', () => {
      const testTypes: TestType[] = [
        {
          ...mockTestType,
          subjects: [
            {
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
            },
          ],
        },
      ];

      const result = updateTestTypesWithSubjectName(testTypes, 1, '物理');

      expect(result[0].subjects[0].name).toBe('物理');
    });

    it('存在しない科目IDの場合は更新しないこと', () => {
      const testTypes: TestType[] = [
        {
          ...mockTestType,
          subjects: [
            {
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
            },
          ],
        },
      ];

      const result = updateTestTypesWithSubjectName(testTypes, 999, '物理');

      expect(result).toEqual(testTypes);
    });
  });
});
