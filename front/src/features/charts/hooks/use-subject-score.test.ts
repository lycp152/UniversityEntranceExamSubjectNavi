/**
 * 科目スコア計算フックのテスト
 * 合計点とカテゴリ別合計点の計算を検証
 *
 * @module use-subject-score.test
 * @description
 * - 全体の合計点計算
 * - カテゴリ別合計点計算
 * - 共通テストと二次試験の合計点計算
 */

import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useCalculateScore } from './use-subject-score';
import type { UISubject } from '@/types/university-subject';

/**
 * テスト用のモックデータ
 */
const mockSubjectData: UISubject = {
  id: 1,
  name: 'テスト科目',
  score: 240,
  percentage: 100,
  displayOrder: 1,
  testTypeId: 1,
  version: 1,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  deletedAt: null,
  createdBy: 'test',
  updatedBy: 'test',
  university: {
    id: 1,
    name: 'テスト大学',
  },
  department: {
    id: 1,
    name: 'テスト学部',
  },
  major: {
    id: 1,
    name: 'テスト学科',
  },
  examInfo: {
    id: 1,
    enrollment: 100,
    academicYear: 2024,
    status: 'active',
  },
  admissionSchedule: {
    id: 1,
    name: 'テスト日程',
    displayOrder: 1,
  },
  subjects: {
    数学: { commonTest: 80, secondTest: 0 },
    英語: { commonTest: 70, secondTest: 0 },
    国語: { commonTest: 90, secondTest: 0 },
  },
};

describe('useCalculateScore フックのテスト', () => {
  describe('通常のケース', () => {
    it('全体の合計点が正しく計算されること', () => {
      const { result } = renderHook(() => useCalculateScore(mockSubjectData));
      expect(result.current.totalScore).toBe(240); // 80 + 70 + 90
    });

    it('共通テストと二次試験の合計点が正しく計算されること', () => {
      const { result } = renderHook(() => useCalculateScore(mockSubjectData));
      expect(result.current.commonTest).toBe(240); // 80 + 70 + 90
      expect(result.current.secondTest).toBe(0);
      expect(result.current.total).toBe(240);
    });

    it('カテゴリ別合計点が正しく計算されること', () => {
      const { result } = renderHook(() => useCalculateScore(mockSubjectData));
      const mathTotal = result.current.calculateCategoryTotal(mockSubjectData.subjects, '数学');
      const englishTotal = result.current.calculateCategoryTotal(mockSubjectData.subjects, '英語');
      const japaneseTotal = result.current.calculateCategoryTotal(mockSubjectData.subjects, '国語');

      expect(mathTotal).toBe(80);
      expect(englishTotal).toBe(70);
      expect(japaneseTotal).toBe(90);
    });
  });

  describe('エッジケース', () => {
    it('空のデータの場合、全ての合計点が0になること', () => {
      const emptyData: UISubject = {
        ...mockSubjectData,
        subjects: {},
      };

      const { result } = renderHook(() => useCalculateScore(emptyData));
      expect(result.current.totalScore).toBe(0);
      expect(result.current.commonTest).toBe(0);
      expect(result.current.secondTest).toBe(0);
      expect(result.current.total).toBe(0);
    });

    it('全てのスコアが0の場合、全ての合計点が0になること', () => {
      const zeroData: UISubject = {
        ...mockSubjectData,
        subjects: {
          数学: { commonTest: 0, secondTest: 0 },
          英語: { commonTest: 0, secondTest: 0 },
          国語: { commonTest: 0, secondTest: 0 },
        },
      };

      const { result } = renderHook(() => useCalculateScore(zeroData));
      expect(result.current.totalScore).toBe(0);
      expect(result.current.commonTest).toBe(0);
      expect(result.current.secondTest).toBe(0);
      expect(result.current.total).toBe(0);
    });
  });

  describe('型の安全性', () => {
    it('型定義が正しく機能すること', () => {
      const { result } = renderHook(() => useCalculateScore(mockSubjectData));
      expect(typeof result.current.totalScore).toBe('number');
      expect(typeof result.current.commonTest).toBe('number');
      expect(typeof result.current.secondTest).toBe('number');
      expect(typeof result.current.total).toBe('number');
      expect(typeof result.current.calculateCategoryTotal).toBe('function');
    });
  });
});
