import { BaseValidator } from '../core/validator';
import type { ValidationRule, ValidationContext } from '../core/types';
import type { ChartData } from '@/lib/types';

/**
 * チャートデータのバリデーションルール
 */
const chartRules: ValidationRule<ChartData>[] = [
  {
    code: 'VALID_VALUE',
    validate: (data) => data.value >= 0,
    message: '値が無効です',
  },
  {
    code: 'VALID_PERCENTAGE',
    validate: (data) => {
      const percentage = parseFloat(data.percentage);
      return !isNaN(percentage) && percentage >= 0 && percentage <= 100;
    },
    message: 'パーセンテージが無効です',
  },
];

/**
 * チャートデータのバリデーター
 */
export class ChartValidator extends BaseValidator<ChartData> {
  constructor(context?: ValidationContext) {
    super(chartRules, context);
  }

  /**
   * チャートデータが有効かどうかを判定
   */
  isValidChartData(data: ChartData): boolean {
    return data.value > 0 && data.name.length > 0;
  }

  /**
   * パーセンテージを計算
   */
  calculatePercentage(value: number, total: number): string {
    if (total === 0) return '0';
    return ((value / total) * 100).toFixed(2);
  }
}
