import { describe, it, expect } from 'vitest';
import { sortUniversities } from './sort-universities';
import type { University } from '@/features/admin/types/university';
import type { EditMode } from '@/features/admin/types/university-list';

/**
 * 大学ソートユーティリティのテスト
 *
 * このテストスイートでは、大学データのソート処理を検証します。
 *
 * @module sort-universities.test
 */

describe('大学ソートユーティリティ', () => {
  const mockUniversities: University[] = [
    {
      id: 2,
      name: 'テスト大学2',
      departments: [],
      version: 1,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      createdBy: 'system',
      updatedBy: 'system',
    },
    {
      id: 1,
      name: 'テスト大学1',
      departments: [],
      version: 1,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      createdBy: 'system',
      updatedBy: 'system',
    },
  ];

  describe('通常モードのソート', () => {
    it('ID順にソートされること', () => {
      const result = sortUniversities(mockUniversities, null);
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(1);
      expect(result[1].id).toBe(2);
    });

    it('空の配列を正しく処理できること', () => {
      const result = sortUniversities([], null);
      expect(result).toEqual([]);
    });

    it('複数の大学データを正しくソートできること', () => {
      const multipleUniversities: University[] = [
        {
          id: 3,
          name: 'テスト大学3',
          departments: [],
          version: 1,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          createdBy: 'system',
          updatedBy: 'system',
        },
        ...mockUniversities,
      ];

      const result = sortUniversities(multipleUniversities, null);
      expect(result).toHaveLength(3);
      expect(result[0].id).toBe(1);
      expect(result[1].id).toBe(2);
      expect(result[2].id).toBe(3);
    });
  });

  describe('編集モードのソート', () => {
    it('新規データの位置が維持されること', () => {
      const editMode: EditMode = {
        universityId: 2,
        departmentId: 1,
        isEditing: true,
        isNew: true,
        insertIndex: 0,
      };

      const result = sortUniversities(mockUniversities, editMode);
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(2);
      expect(result[1].id).toBe(1);
      expect(result[0].name).toBe('テスト大学2');
      expect(result[1].name).toBe('テスト大学1');
    });

    it('新規データでない場合はID順にソートされること', () => {
      const editMode: EditMode = {
        universityId: 2,
        departmentId: 1,
        isEditing: true,
        isNew: false,
      };

      const result = sortUniversities(mockUniversities, editMode);
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(1);
      expect(result[1].id).toBe(2);
    });

    it('編集モードがnullの場合はID順にソートされること', () => {
      const result = sortUniversities(mockUniversities, null);
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(1);
      expect(result[1].id).toBe(2);
    });
  });
});
