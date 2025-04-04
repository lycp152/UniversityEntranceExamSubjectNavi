import { ValidationErrorCode, ValidationSeverity } from '@/lib/validation/constants';
import {
  ValidationResult,
  ValidationError,
  ValidationRule,
  ValidationContext,
} from '@/lib/validation/types';

export interface ValidationMetrics {
  startTime: number;
  executionTime: number;
  ruleExecutionTimes: Record<string, number>;
}

export class ValidationService<T> {
  private readonly rules: ValidationRule<T>[];
  private readonly context?: ValidationContext;

  constructor(rules: ValidationRule<T>[], context?: ValidationContext) {
    this.rules = rules;
    this.context = context;
  }

  private measurePerformance<R>(operation: () => R): [R, number] {
    const start = performance.now();
    const result = operation();
    const executionTime = performance.now() - start;
    return [result, executionTime];
  }

  private validateSingleRule(
    rule: ValidationRule<T>,
    value: T
  ): [boolean, number, ValidationError?] {
    try {
      const [isValid, executionTime] = this.measurePerformance(() => rule.condition(value));

      if (!isValid) {
        return [
          false,
          executionTime,
          {
            field: rule.field,
            message: rule.message,
            code: rule.code,
            severity: rule.severity,
            metadata: {
              ...rule.metadata,
              executionTime,
              timestamp: this.context?.timestamp,
            },
          },
        ];
      }

      return [true, executionTime];
    } catch (error: unknown) {
      console.error(`Validation error in rule ${rule.code}:`, error);
      const errorMessage = error instanceof Error ? error.message : '不明なエラー';

      return [
        false,
        0,
        {
          field: 'validation',
          message: `バリデーション実行中にエラーが発生しました: ${errorMessage}`,
          code: ValidationErrorCode.TRANSFORM_ERROR,
          severity: ValidationSeverity.ERROR,
          metadata: {
            timestamp: this.context?.timestamp,
            originalError: error,
            rule: rule.code,
          },
        },
      ];
    }
  }

  validate(value: T): ValidationResult & { metrics: ValidationMetrics } {
    const startTime = Date.now();
    const errors: ValidationError[] = [];
    const appliedRules: string[] = [];
    const ruleExecutionTimes: Record<string, number> = {};

    for (const rule of this.rules) {
      const [isValid, executionTime, error] = this.validateSingleRule(rule, value);
      ruleExecutionTimes[rule.code] = executionTime;

      if (!isValid && error) {
        errors.push(error);
        appliedRules.push(rule.code);
      }
    }

    const totalDuration = Date.now() - startTime;

    return {
      isValid: errors.length === 0,
      errors,
      metadata: {
        validatedAt: startTime,
        rules: appliedRules,
        performance: {
          validationDuration: totalDuration,
          ruleExecutionTimes,
        },
      },
      metrics: {
        startTime,
        executionTime: totalDuration,
        ruleExecutionTimes,
      },
    };
  }
}
