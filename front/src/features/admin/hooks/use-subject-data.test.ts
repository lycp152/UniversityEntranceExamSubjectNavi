import { renderHook } from '@testing-library/react';
import { useSubjectData } from './use-subject-data';
import { describe, it, expect, beforeEach } from 'vitest';
import type { APISubject } from '@/types/api/types';

/**
 * useSubjectDataのテスト
 *
 * 以下の項目をテストします：
 * - 科目データの更新計算
 * - 新規科目の作成
 * - 科目データの検証
 */
describe('useSubjectData', () => {
  let hook: ReturnType<typeof useSubjectData>;
  const mockSubjects: APISubject[] = [
    {
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
      created_by: 'test-user',
      updated_by: 'test-user',
    },
    {
      id: 2,
      test_type_id: 1,
      name: '英語',
      score: 100,
      percentage: 50,
      display_order: 2,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      deleted_at: null,
      version: 1,
      created_by: 'test-user',
      updated_by: 'test-user',
    },
  ];

  beforeEach(() => {
    const { result } = renderHook(() => useSubjectData());
    hook = result.current;
  });

  describe('calculateUpdatedSubjects', () => {
    it('科目のスコアが正しく更新され、パーセンテージが再計算されること', () => {
      const updatedSubjects = hook.calculateUpdatedSubjects(mockSubjects, 1, 200);

      expect(updatedSubjects).toHaveLength(2);
      expect(updatedSubjects[0].score).toBe(200);
      expect(updatedSubjects[1].score).toBe(100);
      expect(updatedSubjects[0].percentage).toBe(66.67);
      expect(updatedSubjects[1].percentage).toBe(33.33);
    });

    it('空の科目データの場合、空の配列を返すこと', () => {
      const updatedSubjects = hook.calculateUpdatedSubjects([], 1, 200);
      expect(updatedSubjects).toHaveLength(0);
    });

    it('存在しない科目IDの場合、元のデータをそのまま返すこと', () => {
      const updatedSubjects = hook.calculateUpdatedSubjects(mockSubjects, 999, 200);
      expect(updatedSubjects).toEqual(mockSubjects);
    });
  });

  describe('createNewSubject', () => {
    it('新規科目が正しい初期値で作成されること', () => {
      const newSubject = hook.createNewSubject(1, 1);

      expect(newSubject).toMatchObject({
        test_type_id: 1,
        name: '新規科目',
        score: 0,
        percentage: 0,
        display_order: 1,
        version: 1,
      });
      expect(newSubject.id).toBeDefined();
      expect(newSubject.created_at).toBeDefined();
      expect(newSubject.updated_at).toBeDefined();
      expect(newSubject.deleted_at).toBeNull();
    });

    it('作成日時と更新日時が現在時刻であること', () => {
      const newSubject = hook.createNewSubject(1, 1);
      const now = new Date();
      const createdDate = new Date(newSubject.created_at);
      const updatedDate = new Date(newSubject.updated_at);

      expect(createdDate.getTime()).toBeCloseTo(now.getTime(), -3);
      expect(updatedDate.getTime()).toBeCloseTo(now.getTime(), -3);
    });
  });

  describe('validateSubject', () => {
    it('有効な科目データが正しく検証されること', () => {
      const validSubject: APISubject = {
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
        created_by: 'test-user',
        updated_by: 'test-user',
      };

      expect(hook.validateSubject(validSubject)).toBe(true);
    });

    it('無効な科目データが正しく検証されること', () => {
      const invalidSubjects = [
        { ...mockSubjects[0], score: -1 },
        { ...mockSubjects[0], score: 1001 },
        { ...mockSubjects[0], percentage: -1 },
        { ...mockSubjects[0], percentage: 101 },
        { ...mockSubjects[0], display_order: -1 },
        { ...mockSubjects[0], name: '' },
        { ...mockSubjects[0], name: 'a'.repeat(51) },
      ];

      invalidSubjects.forEach(subject => {
        expect(hook.validateSubject(subject)).toBe(false);
      });
    });

    it('必須フィールドが欠けている場合、falseを返すこと', () => {
      const invalidSubject = { ...mockSubjects[0] };
      delete invalidSubject.name;

      expect(() => hook.validateSubject(invalidSubject)).toThrow();
    });
  });
});
