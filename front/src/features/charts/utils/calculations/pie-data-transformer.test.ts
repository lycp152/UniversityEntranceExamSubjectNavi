import { describe, expect, it } from 'vitest';
import { transformToPieData } from './pie-data-transformer';
import { CHART_ERROR_CODES } from '@/constants/errors/chart';
import { EXAM_TYPES } from '@/constants/constraint/exam-types';

describe('円グラフデータ変換', () => {
  describe('transformToPieData', () => {
    it('正常なデータを変換できる - 整数値の場合', () => {
      const result = transformToPieData({
        value: 80,
        totalScore: 100,
        name: '英語',
        testTypeId: EXAM_TYPES.COMMON.id,
        percentage: 80,
        displayOrder: 1,
      });

      expect(result).toEqual({
        data: {
          name: '英語',
          value: 80,
          percentage: 80,
        },
      });
    });

    it('正常なデータを変換できる - 小数点以下の値の場合', () => {
      const result = transformToPieData({
        value: 75.5,
        totalScore: 100,
        name: '英語',
        testTypeId: EXAM_TYPES.COMMON.id,
        percentage: 75.5,
        displayOrder: 1,
      });

      expect(result).toEqual({
        data: {
          name: '英語',
          value: 75.5,
          percentage: 75.5,
        },
      });
    });

    it('負の値の場合、エラーを返す - 入力値の検証', () => {
      const result = transformToPieData({
        value: -10,
        totalScore: 100,
        name: '英語',
        testTypeId: EXAM_TYPES.COMMON.id,
        percentage: 0,
        displayOrder: 1,
      });

      expect(result.error).toBeDefined();
      expect(result.error?.code).toBe(CHART_ERROR_CODES.INVALID_DATA_FORMAT);
      expect(result.data.percentage).toBe(0);
    });

    it('合計スコアが0の場合、エラーを返す - 除算エラーの検証', () => {
      const result = transformToPieData({
        value: 80,
        totalScore: 0,
        name: '英語',
        testTypeId: EXAM_TYPES.COMMON.id,
        percentage: 0,
        displayOrder: 1,
      });

      expect(result.error).toBeDefined();
      expect(result.error?.code).toBe(CHART_ERROR_CODES.INVALID_PERCENTAGE);
      expect(result.data.percentage).toBe(0);
    });

    it('パーセンテージが100を超える場合、エラーを返す - 範囲チェック', () => {
      const result = transformToPieData({
        value: 150,
        totalScore: 100,
        name: '英語',
        testTypeId: EXAM_TYPES.COMMON.id,
        percentage: 150,
        displayOrder: 1,
      });

      expect(result.error).toBeDefined();
      expect(result.error?.code).toBe(CHART_ERROR_CODES.INVALID_PERCENTAGE);
      expect(result.data.percentage).toBe(0);
    });

    it('パーセンテージが0の場合、正常に処理される - 境界値テスト', () => {
      const result = transformToPieData({
        value: 0,
        totalScore: 100,
        name: '英語',
        testTypeId: EXAM_TYPES.COMMON.id,
        percentage: 0,
        displayOrder: 1,
      });

      expect(result).toEqual({
        data: {
          name: '英語',
          value: 0,
          percentage: 0,
        },
      });
    });

    it('パフォーマンステスト - 大量のデータを処理できる', () => {
      const startTime = performance.now();

      for (let i = 0; i < 1000; i++) {
        transformToPieData({
          value: 80,
          totalScore: 100,
          name: '英語',
          testTypeId: EXAM_TYPES.COMMON.id,
          percentage: 80,
          displayOrder: 1,
        });
      }

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      expect(executionTime).toBeLessThan(100); // 100ms以内に処理が完了することを期待
    });
  });
});
