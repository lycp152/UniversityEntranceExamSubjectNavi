import { describe, expect, it } from 'vitest';
import {
  createChartMetadata,
  getCategoryType,
  getSubjectChartOrder,
  sortSubjectScores,
  sortByCommonSubject,
  sortSubjectDetailedData,
  createChartErrorResult,
} from './chart-utils';
import { EXAM_TYPES } from '@/constants/constraint/exam-types';
import { SUBJECTS } from '@/constants/constraint/subjects/subjects';
import { SUBJECT_CATEGORIES } from '@/constants/constraint/subjects/subject-categories';
import type { DisplaySubjectScore } from '@/types/score';
import type { ChartError } from '@/types/pie-chart';

describe('chart-utils', () => {
  describe('createChartMetadata', () => {
    it('メタデータを正しく生成する', () => {
      const startTime = Date.now();
      const totalItems = 10;
      const data = [1, 2, 3];
      const errors: ChartError[] = [];

      const result = createChartMetadata(startTime, totalItems, data, errors);

      expect(result).toEqual({
        processedAt: startTime,
        totalItems,
        successCount: data.length,
        errorCount: errors.length,
      });
    });
  });

  describe('getCategoryType', () => {
    it('共通科目のカテゴリを正しく判定する', () => {
      expect(getCategoryType('共通国語')).toBe(EXAM_TYPES.COMMON.name);
    });

    it('二次科目のカテゴリを正しく判定する', () => {
      expect(getCategoryType('二次数学')).toBe(EXAM_TYPES.SECONDARY.name);
    });

    it('その他の科目のカテゴリを正しく判定する', () => {
      expect(getCategoryType(SUBJECTS.SCIENCE)).toBe(SUBJECT_CATEGORIES.SCIENCE.category);
    });
  });

  describe('getSubjectChartOrder', () => {
    it('共通科目の左側の順序を正しく判定する', () => {
      expect(getSubjectChartOrder('共通国語L')).toBe(0);
    });

    it('共通科目の右側の順序を正しく判定する', () => {
      expect(getSubjectChartOrder('共通国語R')).toBe(1);
    });

    it('二次科目の左側の順序を正しく判定する', () => {
      expect(getSubjectChartOrder('二次数学L')).toBe(2);
    });

    it('二次科目の右側の順序を正しく判定する', () => {
      expect(getSubjectChartOrder('二次数学R')).toBe(3);
    });

    it('その他の科目の順序を正しく判定する', () => {
      expect(getSubjectChartOrder(SUBJECTS.SCIENCE)).toBe(999);
    });
  });

  describe('sortSubjectScores', () => {
    it('科目スコアを正しくソートする', () => {
      const items: DisplaySubjectScore[] = [
        {
          name: SUBJECTS.MATH,
          value: 80,
          percentage: 0.8,
          category: SUBJECT_CATEGORIES.MATH.category,
        },
        {
          name: SUBJECTS.JAPANESE,
          value: 90,
          percentage: 0.9,
          category: SUBJECT_CATEGORIES.JAPANESE.category,
        },
      ];

      const result = sortSubjectScores(items, (a, b) => a.value - b.value);

      expect(result).toEqual([
        {
          name: SUBJECTS.MATH,
          value: 80,
          percentage: 0.8,
          category: SUBJECT_CATEGORIES.MATH.category,
        },
        {
          name: SUBJECTS.JAPANESE,
          value: 90,
          percentage: 0.9,
          category: SUBJECT_CATEGORIES.JAPANESE.category,
        },
      ]);
    });
  });

  describe('sortByCommonSubject', () => {
    it('共通科目を優先的にソートする', () => {
      const items: DisplaySubjectScore[] = [
        {
          name: '二次数学',
          value: 80,
          percentage: 0.8,
          category: SUBJECT_CATEGORIES.MATH.category,
        },
        {
          name: '共通国語',
          value: 90,
          percentage: 0.9,
          category: SUBJECT_CATEGORIES.JAPANESE.category,
        },
      ];

      const result = sortByCommonSubject(items);

      expect(result[0].name).toBe('共通国語');
      expect(result[1].name).toBe('二次数学');
    });
  });

  describe('sortSubjectDetailedData', () => {
    it('科目チャートのデータを時計回りに並び替える', () => {
      const items: DisplaySubjectScore[] = [
        {
          name: '二次数学R',
          value: 80,
          percentage: 0.8,
          category: SUBJECT_CATEGORIES.MATH.category,
        },
        {
          name: '共通国語L',
          value: 90,
          percentage: 0.9,
          category: SUBJECT_CATEGORIES.JAPANESE.category,
        },
      ];

      const result = sortSubjectDetailedData(items);

      expect(result[0].name).toBe('共通国語L');
      expect(result[1].name).toBe('二次数学R');
    });
  });

  describe('createChartErrorResult', () => {
    it('エラー結果を正しく生成する', () => {
      const errors: ChartError[] = [
        {
          code: 'TRANSFORM_ERROR',
          message: 'エラーが発生しました',
          field: 'data',
          severity: 'error',
        },
      ];

      const result = createChartErrorResult<number>(errors);

      expect(result).toEqual({
        data: [],
        errors,
        hasErrors: true,
        status: 'error',
      });
    });
  });
});
