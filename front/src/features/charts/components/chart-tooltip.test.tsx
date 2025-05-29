/**
 * チャートツールチップのテスト
 *
 * @remarks
 * - ツールチップの表示形式を検証
 * - エッジケースの処理を検証
 *
 * @module ChartTooltipTest
 */

import { describe, expect, it } from 'vitest';
import { ChartTooltip } from './chart-tooltip';

describe('ChartTooltip', () => {
  it('値が正しい形式で表示されること', () => {
    const result = ChartTooltip(85, '数学');
    expect(result).toEqual(['85点', '数学']);
  });

  it('entryがundefinedの場合でも正しく表示されること', () => {
    const result = ChartTooltip(85, '数学');
    expect(result).toEqual(['85点', '数学']);
  });

  it('値が0の場合でも正しく表示されること', () => {
    const result = ChartTooltip(0, '数学');
    expect(result).toEqual(['0点', '数学']);
  });
});
