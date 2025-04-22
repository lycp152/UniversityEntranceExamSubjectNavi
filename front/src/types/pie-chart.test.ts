import { describe, it, expect } from 'vitest';
import type {
  PieData,
  DetailedPieData,
  CustomLabelProps,
  ChartError,
  ChartResult,
  ChartData,
} from './pie-chart';
import { ExamType } from '@/constants/constraint/exam-types';
import { ChartErrorCode, ChartErrorSeverity } from '@/constants/errors/chart';

/**
 * 円グラフの型定義のテスト
 * 型の整合性と型安全性を検証します
 */
describe('円グラフの型定義', () => {
  describe('PieData', () => {
    it('基本的なチャートデータが正しく定義されている', () => {
      const data: PieData = {
        name: 'テストデータ',
        value: 100,
        percentage: 50,
      };

      expect(data.name).toBe('テストデータ');
      expect(data.value).toBe(100);
      expect(data.percentage).toBe(50);
    });

    it('パーセンテージの範囲が正しい', () => {
      const validData: PieData = {
        name: 'テストデータ',
        value: 100,
        percentage: 0,
      };

      // パーセンテージの範囲チェック
      expect(validData.percentage).toBeGreaterThanOrEqual(0);
      expect(validData.percentage).toBeLessThanOrEqual(100);

      // 境界値のテスト
      const boundaryData: PieData = {
        name: 'テストデータ',
        value: 100,
        percentage: 100,
      };

      expect(boundaryData.percentage).toBe(100);
    });
  });

  describe('DetailedPieData', () => {
    it('詳細なチャートデータが正しく定義されている', () => {
      const data: DetailedPieData = {
        name: 'テストデータ',
        value: 100,
        percentage: 50,
        category: 'テストカテゴリ',
        type: 'common' as ExamType,
        testTypeId: 1,
        displayOrder: 1,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        version: 1,
        createdBy: 'test-user',
        updatedBy: 'test-user',
      };

      expect(data.category).toBe('テストカテゴリ');
      expect(data.testTypeId).toBe(1);
      expect(data.displayOrder).toBe(1);
    });

    it('オプショナルフィールドが正しく定義されている', () => {
      const data: DetailedPieData = {
        name: 'テストデータ',
        value: 100,
        percentage: 50,
        category: 'テストカテゴリ',
        type: 'common' as ExamType,
        testTypeId: 1,
        displayOrder: 1,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        deletedAt: '2024-01-01T00:00:00Z',
        version: 1,
        createdBy: 'test-user',
        updatedBy: 'test-user',
        displayName: '表示用名称',
      };

      expect(data.deletedAt).toBe('2024-01-01T00:00:00Z');
      expect(data.displayName).toBe('表示用名称');
    });
  });

  describe('CustomLabelProps', () => {
    it('カスタムラベルのプロパティが正しく定義されている', () => {
      const props: CustomLabelProps = {
        cx: 100,
        cy: 100,
        midAngle: 45,
        innerRadius: 50,
        outerRadius: 100,
        percent: 0.5,
        name: 'テストラベル',
      };

      expect(props.cx).toBe(100);
      expect(props.cy).toBe(100);
      expect(props.midAngle).toBe(45);
      expect(props.percent).toBe(0.5);
    });

    it('オプショナルプロパティが正しく定義されている', () => {
      const props: CustomLabelProps = {
        cx: 100,
        cy: 100,
        midAngle: 45,
        innerRadius: 50,
        outerRadius: 100,
        percent: 0.5,
        name: 'テストラベル',
        displayName: '表示用ラベル',
        isRightChart: true,
      };

      expect(props.displayName).toBe('表示用ラベル');
      expect(props.isRightChart).toBe(true);
    });
  });

  describe('ChartError', () => {
    it('チャートエラーが正しく定義されている', () => {
      const error: ChartError = {
        code: 'INVALID_DATA' as ChartErrorCode,
        field: 'testField',
        message: 'テストエラーメッセージ',
        severity: 'error' as ChartErrorSeverity,
      };

      expect(error.code).toBe('INVALID_DATA');
      expect(error.field).toBe('testField');
      expect(error.message).toBe('テストエラーメッセージ');
      expect(error.severity).toBe('error');
    });
  });

  describe('ChartResult', () => {
    it('チャート結果が正しく定義されている', () => {
      const result: ChartResult<PieData> = {
        data: [
          {
            name: 'テストデータ',
            value: 100,
            percentage: 50,
          },
        ],
        errors: [],
        hasErrors: false,
        status: 'success',
        metadata: {
          processedAt: Date.now(),
          totalItems: 1,
          successCount: 1,
          errorCount: 0,
        },
      };

      expect(result.data).toHaveLength(1);
      expect(result.errors).toHaveLength(0);
      expect(result.hasErrors).toBe(false);
      expect(result.status).toBe('success');
      expect(result.metadata).toBeDefined();
    });
  });

  describe('ChartData', () => {
    it('チャートデータが正しく定義されている', () => {
      const data: ChartData = {
        detailedData: [
          {
            name: 'テストデータ',
            value: 100,
            percentage: 50,
            category: 'テストカテゴリ',
            type: 'common' as ExamType,
            testTypeId: 1,
            displayOrder: 1,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
            version: 1,
            createdBy: 'test-user',
            updatedBy: 'test-user',
          },
        ],
        outerData: [
          {
            name: 'テストデータ',
            value: 100,
            percentage: 50,
          },
        ],
        errors: [],
      };

      expect(data.detailedData).toHaveLength(1);
      expect(data.outerData).toHaveLength(1);
      expect(data.errors).toHaveLength(0);
    });
  });
});
