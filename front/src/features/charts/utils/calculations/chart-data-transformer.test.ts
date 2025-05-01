import { describe, expect, it } from 'vitest';
import { createDetailedPieData, createOuterPieData } from './chart-data-transformer';
import { EXAM_TYPES } from '@/constants/constraint/exam-types';

describe('chart-data-transformer', () => {
  describe('createDetailedPieData', () => {
    it('共通テストの科目データを正しく変換する', () => {
      const result = createDetailedPieData('数学', 80, 100, EXAM_TYPES.COMMON.name);

      expect(result).toHaveProperty('name', '数学(共通)');
      expect(result).toHaveProperty('value', 80);
      expect(result).toHaveProperty('percentage', 80);
      expect(result).toHaveProperty('type', EXAM_TYPES.COMMON.name);
      expect(result).toHaveProperty('testTypeId', EXAM_TYPES.COMMON.id);
      expect(result).toHaveProperty('category', '数学');
    });

    it('二次試験の科目データを正しく変換する', () => {
      const result = createDetailedPieData('理科', 90, 100, EXAM_TYPES.SECONDARY.name);

      expect(result).toHaveProperty('name', '理科(二次)');
      expect(result).toHaveProperty('value', 90);
      expect(result).toHaveProperty('percentage', 90);
      expect(result).toHaveProperty('type', EXAM_TYPES.SECONDARY.name);
      expect(result).toHaveProperty('testTypeId', EXAM_TYPES.SECONDARY.id);
      expect(result).toHaveProperty('category', '理科');
    });

    it('合計スコアが0の場合でも正しく動作する', () => {
      const result = createDetailedPieData('数学', 0, 0, EXAM_TYPES.COMMON.name);

      expect(result).toHaveProperty('value', 0);
      expect(result).toHaveProperty('percentage', 0);
    });
  });

  describe('createOuterPieData', () => {
    it('カテゴリーデータを正しく変換する', () => {
      const result = createOuterPieData('数学', 80, 100);

      expect(result).toHaveProperty('name', '数学');
      expect(result).toHaveProperty('value', 80);
      expect(result).toHaveProperty('percentage', 80);
    });

    it('合計スコアが0の場合でも正しく動作する', () => {
      const result = createOuterPieData('数学', 0, 0);

      expect(result).toHaveProperty('value', 0);
      expect(result).toHaveProperty('percentage', 0);
    });
  });
});
