import type { ValidationRule } from "@/types/validation";
import { ValidationError, ValidationErrorDetail } from "./ValidationError";
import { ValidationRuleCache } from "./ValidationRuleCache";
import { ValidationCategory, ValidationSeverity } from "./ValidationErrorTypes";

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
        this.rules = cachedRules;
      }
    }
  }

  addRule(rule: ValidationRule<T>): this {
    this.rules.push(rule);
    return this;
  }

  addConditionalRules(
    condition: (value: T) => boolean,
    rules: ValidationRule<T>[]
  ): this {
    this.conditionalRules.push({ condition, rules });
    return this;
  }

  addDependencyRule(rule: DependencyRule<T>): this {
    this.dependencyRules.push(rule);
    return this;
  }

  private validateBasicRules(value: T): ValidationErrorDetail[] {
    return this.rules
      .filter((rule) => !rule.validate(value))
      .map((rule) => ({
        field: rule.code,
        message: rule.message,
        category: ValidationCategory.FORMAT,
        severity: ValidationSeverity.ERROR,
      }));
  }

  private validateConditionalRules(value: T): ValidationErrorDetail[] {
    return this.conditionalRules
      .filter((rule) => rule.condition(value))
      .flatMap((rule) =>
        rule.rules
          .filter((r) => !r.validate(value))
          .map((r) => ({
            field: r.code,
            message: r.message,
            category: ValidationCategory.FORMAT,
            severity: ValidationSeverity.ERROR,
          }))
      );
  }

  private validateDependencyRules(
    value: T,
    dependencies?: Record<string, unknown>
  ): ValidationErrorDetail[] {
    return this.dependencyRules
      .filter((rule) => !rule.validate(value, dependencies || {}))
      .map((rule) => ({
        field: rule.field,
        message: rule.message,
        category: ValidationCategory.DEPENDENCY,
        severity: ValidationSeverity.ERROR,
      }));
  }

  validate(value: T, dependencies?: Record<string, unknown>): void {
    const errors: ValidationErrorDetail[] = [
      ...this.validateBasicRules(value),
      ...this.validateConditionalRules(value),
      ...this.validateDependencyRules(value, dependencies),
    ];

    if (errors.length > 0) {
      throw new ValidationError("バリデーションエラー", errors);
    }

    // キャッシュの更新
    if (this.cacheKey) {
      this.cache.setCachedRules(this.cacheKey, this.rules);
    }
  }
}
