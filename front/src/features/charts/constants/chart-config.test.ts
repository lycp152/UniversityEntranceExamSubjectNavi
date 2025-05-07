import { describe, expect, it } from 'vitest';
import { CHART, COMMON_PIE_PROPS, RADIAN } from './chart-config';

describe('chart-config', () => {
  describe('CHART', () => {
    it('内側の円グラフの設定が正しい', () => {
      expect(CHART.INNER_CHART.INNER_RADIUS).toBe(0);
      expect(CHART.INNER_CHART.OUTER_RADIUS).toBe(140);
    });

    it('外側の円グラフの設定が正しい', () => {
      expect(CHART.OUTER_CHART.INNER_RADIUS).toBe(160);
      expect(CHART.OUTER_CHART.OUTER_RADIUS).toBe(200);
    });

    it('共通の設定が正しい', () => {
      expect(CHART.COMMON.START_ANGLE).toBe(90);
      expect(CHART.COMMON.END_ANGLE).toBe(-270);
      expect(CHART.COMMON.CENTER_X).toBe('50%');
      expect(CHART.COMMON.CENTER_Y).toBe('50%');
    });
  });

  describe('COMMON_PIE_PROPS', () => {
    it('共通のプロパティが正しい', () => {
      expect(COMMON_PIE_PROPS.cx).toBe(CHART.COMMON.CENTER_X);
      expect(COMMON_PIE_PROPS.cy).toBe(CHART.COMMON.CENTER_Y);
      expect(COMMON_PIE_PROPS.startAngle).toBe(CHART.COMMON.START_ANGLE);
      expect(COMMON_PIE_PROPS.endAngle).toBe(CHART.COMMON.END_ANGLE);
    });
  });

  describe('RADIAN', () => {
    it('ラジアン変換用の定数が正しい', () => {
      expect(RADIAN).toBe(Math.PI / 180);
    });
  });
});
