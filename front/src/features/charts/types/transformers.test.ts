/**
 * データ変換の型定義のテスト
 * チャートデータの変換処理に関する型定義のテストを管理
 *
 * @module transformers.test
 * @description
 * - 変換後の科目データの型定義のテスト
 * - 基本的な変換パラメータの型定義のテスト
 * - 変換結果の型定義のテスト
 */

import { describe, it, expect } from 'vitest';
import { TransformedSubjectData, BaseTransformParams, TransformResult } from './transformers';
import { ErrorSeverity } from '@/types/error';

describe('TransformedSubjectData', () => {
  it('正しい型のプロパティを持つ', () => {
    const data: TransformedSubjectData = {
      name: 'math',
      displayName: '数学',
      category: '理科系',
      testTypeId: 1,
      percentage: 80,
      displayOrder: 1,
    };

    expect(data).toBeDefined();
    expect(data.name).toBeTypeOf('string');
    expect(data.displayName).toBeTypeOf('string');
    expect(data.category).toBeTypeOf('string');
    expect(data.testTypeId).toBeTypeOf('number');
    expect(data.percentage).toBeTypeOf('number');
    expect(data.displayOrder).toBeTypeOf('number');
  });

  it('必須プロパティが存在する', () => {
    const data: TransformedSubjectData = {
      name: 'math',
      displayName: '数学',
      category: '理科系',
      testTypeId: 1,
      percentage: 80,
      displayOrder: 1,
    };

    expect(data.name).toBeDefined();
    expect(data.displayName).toBeDefined();
    expect(data.category).toBeDefined();
    expect(data.testTypeId).toBeDefined();
    expect(data.percentage).toBeDefined();
    expect(data.displayOrder).toBeDefined();
  });
});

describe('BaseTransformParams', () => {
  it('正しい型のプロパティを持つ', () => {
    const params: BaseTransformParams = {
      value: 80,
      totalScore: 100,
      name: 'math',
      testTypeId: 1,
      percentage: 80,
      displayOrder: 1,
    };

    expect(params).toBeDefined();
    expect(params.value).toBeTypeOf('number');
    expect(params.totalScore).toBeTypeOf('number');
    expect(params.name).toBeTypeOf('string');
    expect(params.testTypeId).toBeTypeOf('number');
    expect(params.percentage).toBeTypeOf('number');
    expect(params.displayOrder).toBeTypeOf('number');
  });

  it('必須プロパティが存在する', () => {
    const params: BaseTransformParams = {
      value: 80,
      totalScore: 100,
      name: 'math',
      testTypeId: 1,
      percentage: 80,
      displayOrder: 1,
    };

    expect(params.value).toBeDefined();
    expect(params.totalScore).toBeDefined();
    expect(params.name).toBeDefined();
    expect(params.testTypeId).toBeDefined();
    expect(params.percentage).toBeDefined();
    expect(params.displayOrder).toBeDefined();
  });
});

describe('TransformResult', () => {
  it('正しい型のプロパティを持つ', () => {
    const result: TransformResult = {
      data: {
        name: 'math',
        value: 80,
        percentage: 80,
      },
      error: {
        message: 'エラーが発生しました',
        code: 'TRANSFORM_ERROR',
        field: 'transform',
        severity: 'error' as ErrorSeverity,
      },
    };

    expect(result).toBeDefined();
    expect(result.data).toBeDefined();
    expect(result.error).toBeDefined();
    expect(result.data.name).toBeTypeOf('string');
    expect(result.data.value).toBeTypeOf('number');
    expect(result.data.percentage).toBeTypeOf('number');
    expect(result.error?.message).toBeTypeOf('string');
    expect(result.error?.code).toBeTypeOf('string');
    expect(result.error?.field).toBeTypeOf('string');
    expect(result.error?.severity).toBeTypeOf('string');
  });

  it('必須プロパティが存在する', () => {
    const result: TransformResult = {
      data: {
        name: 'math',
        value: 80,
        percentage: 80,
      },
    };

    expect(result.data).toBeDefined();
    expect(result.data.name).toBeDefined();
    expect(result.data.value).toBeDefined();
    expect(result.data.percentage).toBeDefined();
  });
});
