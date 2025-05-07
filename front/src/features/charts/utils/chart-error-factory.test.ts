import { describe, expect, it } from 'vitest';
import { createChartError } from './chart-error-factory';
import { CHART_ERROR_CODES } from '@/constants/errors/chart';

describe('chart-error-factory', () => {
  describe('createChartError', () => {
    it('デフォルトの重大度でエラーを生成する', () => {
      const result = createChartError(
        CHART_ERROR_CODES.INVALID_DATA_FORMAT,
        'データが無効です',
        '数学'
      );

      expect(result).toHaveProperty('code', CHART_ERROR_CODES.INVALID_DATA_FORMAT);
      expect(result).toHaveProperty('field', '数学');
      expect(result).toHaveProperty('message', 'データが無効です');
      expect(result).toHaveProperty('severity', 'error');
    });

    it('カスタムの重大度でエラーを生成する', () => {
      const result = createChartError(
        CHART_ERROR_CODES.INVALID_DATA_FORMAT,
        'データが無効です',
        '数学',
        {
          severity: 'warning',
        }
      );

      expect(result).toHaveProperty('severity', 'warning');
    });

    it('詳細情報を含むエラーを生成する', () => {
      const details = { reason: 'データ形式が不正' };
      const result = createChartError(
        CHART_ERROR_CODES.INVALID_DATA_FORMAT,
        'データが無効です',
        '数学',
        {
          details,
        }
      );

      expect(result).toHaveProperty('details', details);
    });
  });
});
