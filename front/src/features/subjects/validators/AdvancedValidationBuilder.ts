import type { ValidationRule } from '@/lib/validation/types';
import { ValidationError } from '@/lib/validation/types';
import { ValidationRuleCache } from '@/features/subjects/constants/validation-rule-cache';
import {
  ValidationCategory,
  ValidationSeverity,
  ValidationErrorCode,
} from '@/lib/validation/constants';

interface ConditionalRule<T> {
  condition: (value: T) => boolean;
  rules: ValidationRule<T>[];
}

interface DependencyRule<T> {
  dependencies: string[];
  validate: (value: T, dependencies: Record<string, unknown>) => boolean;
  message: string;
  field: string;
}

export class AdvancedValidationBuilder<T> {
  private readonly rules: ValidationRule<T>[] = [];
  private readonly conditionalRules: ConditionalRule<T>[] = [];
  private readonly dependencyRules: DependencyRule<T>[] = [];
  private readonly cache: ValidationRuleCache<T>;

  constructor(private readonly cacheKey?: string) {
    this.cache = ValidationRuleCache.getInstance<T>();
    if (cacheKey) {
      const cachedRules = this.cache.getCachedRules(cacheKey);
      if (cachedRules) {
        this.rules = cachedRules.map(rule => ({
          ...rule,
          name: rule.code,
          severity: ValidationSeverity.ERROR,
          category: ValidationCategory.TRANSFORM,
          condition: (data: T) => {
            return Boolean(rule.condition(data));
          },
        }));
      }
    }
  }

  addRule(rule: ValidationRule<T>): this {
    this.rules.push(rule);
    return this;
  }

  addConditionalRules(condition: (value: T) => boolean, rules: ValidationRule<T>[]): this {
    this.conditionalRules.push({ condition, rules });
    return this;
  }

  addDependencyRule(rule: DependencyRule<T>): this {
    this.dependencyRules.push(rule);
    return this;
  }

  private validateBasicRules(value: T): ValidationError[] {
    return this.rules
      .filter(rule => !rule.condition(value))
      .map(rule => ({
        field: rule.code,
        message: rule.message,
        code: ValidationErrorCode.INVALID_DATA_FORMAT,
        severity: ValidationSeverity.ERROR,
      }));
  }

  private validateConditionalRules(value: T): ValidationError[] {
    return this.conditionalRules
      .filter(rule => rule.condition(value))
      .flatMap(rule =>
        rule.rules
          .filter(r => !r.condition(value))
          .map(r => ({
            field: r.code,
            message: r.message,
            code: ValidationErrorCode.INVALID_DATA_FORMAT,
            severity: ValidationSeverity.ERROR,
          }))
      );
  }

  private validateDependencyRules(
    value: T,
    dependencies?: Record<string, unknown>
  ): ValidationError[] {
    return this.dependencyRules
      .filter(rule => !rule.validate(value, dependencies || {}))
      .map(rule => ({
        field: rule.field,
        message: rule.message,
        code: ValidationErrorCode.INVALID_DATA_FORMAT,
        severity: ValidationSeverity.ERROR,
      }));
  }

  validate(value: T, dependencies?: Record<string, unknown>): void {
    const errors: ValidationError[] = [
      ...this.validateBasicRules(value),
      ...this.validateConditionalRules(value),
      ...this.validateDependencyRules(value, dependencies),
    ];

    if (errors.length > 0) {
      throw errors[0];
    }

    // キャッシュの更新
    if (this.cacheKey) {
      this.cache.setCachedRules(this.cacheKey, this.rules);
    }
  }
}
