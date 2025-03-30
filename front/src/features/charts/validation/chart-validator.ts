import { BaseValidator } from '@/utils/validation/base-validator';
import {
  ValidationErrorCode,
  ValidationSeverity,
  ValidationCategory,
} from '@/lib/validation/constants';
import { ValidationRule, ValidationContext, ValidationResult } from '@/lib/validation/types';

interface ChartData {
  name: string;
  value: number;
  percentage: string;
}

/**
 * チャートデータのバリデーションルール
 */
const chartRules: ValidationRule<ChartData>[] = [
  {
    code: ValidationErrorCode.INVALID_DATA_FORMAT,
    field: 'value',
    condition: (data: ChartData) => data.value >= 0,
    message: '値が無効です',
    severity: ValidationSeverity.ERROR,
    category: ValidationCategory.FORMAT,
  },
  {
    code: ValidationErrorCode.INVALID_PERCENTAGE,
    field: 'percentage',
    condition: (data: ChartData) => {
      const percentage = parseFloat(data.percentage);
      return !isNaN(percentage) && percentage >= 0 && percentage <= 100;
    },
    message: 'パーセンテージが無効です',
    severity: ValidationSeverity.ERROR,
    category: ValidationCategory.FORMAT,
  },
];

/**
 * チャートデータのバリデーター
 */
export class ChartValidator extends BaseValidator<ChartData> {
  constructor(context?: ValidationContext) {
    super(context);
  }

  /**
   * バリデーションを実行する
   */
  async validate(data: unknown): Promise<ValidationResult<ChartData>> {
    const chartData = data as ChartData;
    const isValid = this.isValidChartData(chartData);

    return {
      isValid,
      data: isValid ? chartData : undefined,
      errors: isValid
        ? []
        : [
            {
              code: ValidationErrorCode.INVALID_DATA_FORMAT,
              message: 'チャートデータが無効です',
              field: 'chartData',
              severity: ValidationSeverity.ERROR,
            },
          ],
      metadata: {
        validatedAt: Date.now(),
        rules: chartRules.map(rule => rule.code),
      },
    };
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
