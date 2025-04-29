/**
 * チャートツールチップのテスト
 *
 * @remarks
 * - ツールチップの表示形式を検証
 * - パーセンテージの計算を検証
 * - エッジケースの処理を検証
 *
 * @module ChartTooltipTest
 */

import { describe, expect, it } from 'vitest';
import { ChartTooltip } from './chart-tooltip';
import { TooltipPayload } from '../types/chart';

describe('ChartTooltip', () => {
  it('パーセンテージが存在する場合、正しい形式で表示されること', () => {
    const entry: TooltipPayload = {
      payload: {
        percentage: 0.25,
      },
    };
    const result = ChartTooltip(85, '数学', entry);
    expect(result).toEqual(['85点 (25.0%)', '数学']);
  });

  it('パーセンテージが存在しない場合、値のみが表示されること', () => {
    const entry: TooltipPayload = {
      payload: {},
    };
    const result = ChartTooltip(85, '数学', entry);
    expect(result).toEqual(['85点', '数学']);
  });

  it('パーセンテージが0の場合、正しい形式で表示されること', () => {
    const entry: TooltipPayload = {
      payload: {
        percentage: 0,
      },
    };
    const result = ChartTooltip(85, '数学', entry);
    expect(result).toEqual(['85点 (0.0%)', '数学']);
  });

  it('パーセンテージが1の場合、正しい形式で表示されること', () => {
    const entry: TooltipPayload = {
      payload: {
        percentage: 1,
      },
    };
    const result = ChartTooltip(85, '数学', entry);
    expect(result).toEqual(['85点 (100.0%)', '数学']);
  });

  it('entryがundefinedの場合、値のみが表示されること', () => {
    const result = ChartTooltip(85, '数学');
    expect(result).toEqual(['85点', '数学']);
  });
});
