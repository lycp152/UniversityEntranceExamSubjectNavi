import { ErrorCategory } from "@/features/charts/subject/donut/types/errors";
import { ChartError } from "@/types/subject/error";
import { ErrorCode } from "../constants/errorCodes";
import {
  ScoreValidationRules,
  ValidationResult,
  ValidationError,
  ValidationRule,
} from "../types/validation";

// パフォーマンス最適化のためのキャッシュ
const ruleResultCache = new Map<string, ValidationResult>();
const CACHE_TTL = 5 * 60 * 1000; // 5分

export interface ErrorOptions {
  severity?: ChartError["severity"];
  details?: unknown;
  timestamp?: number;
  cacheable?: boolean;
}

export class ValidationRuleBuilder {
  private readonly rules: ValidationRule<number>[] = [];
  private readonly ruleCache = new Map<string, ValidationRule<number>>();
  private readonly priorityQueue: ValidationRule<number>[] = [];

  addRule(rule: ValidationRule<number>, priority = false): this {
    const cacheKey = `${rule.code}:${rule.category}`;
    if (!this.ruleCache.has(cacheKey)) {
      this.ruleCache.set(cacheKey, rule);
      if (priority) {
        this.priorityQueue.push(rule);
      } else {
        this.rules.push(rule);
      }
    }
    return this;
  }

  addRules(rules: ValidationRule<number>[], priority = false): this {
    rules.forEach((rule) => this.addRule(rule, priority));
    return this;
  }

  removeRule(code: string): this {
    const index = this.rules.findIndex((rule) => rule.code === code);
    if (index !== -1) {
      this.rules.splice(index, 1);
      this.ruleCache.delete(code);
    }
    return this;
  }

  build(): ValidationRule<number>[] {
    return [...this.priorityQueue, ...this.rules];
  }

  clear(): this {
    this.rules.length = 0;
    this.priorityQueue.length = 0;
    this.ruleCache.clear();
    return this;
  }
}

const createNumberRule = (
  validate: (value: number) => boolean,
  code: string,
  message: string,
  severity: ChartError["severity"] = "error",
  options: { category?: ErrorCategory; metadata?: Record<string, unknown> } = {}
): ValidationRule<number> => ({
  name: code,
  validate,
  message,
  code,
  severity,
  category: options.category ?? "validation",
  metadata: options.metadata,
});

export const SCORE_RULES = {
  isValid: createNumberRule(
    (value) => value != null && !isNaN(value),
    "INVALID_SCORE",
    "スコアが無効です",
    "error",
    { metadata: { critical: true } }
  ),
  isPositive: createNumberRule(
    (value) => value > 0,
    "POSITIVE_SCORE",
    "スコアは正の数である必要があります"
  ),
  createMinRule: (min: number) =>
    createNumberRule(
      (value) => value >= min,
      "MIN_SCORE_REQUIRED",
      `スコアは${min}以上である必要があります`,
      "error",
      { metadata: { min } }
    ),
  createMaxRule: (max: number) =>
    createNumberRule(
      (value) => value <= max,
      "MAX_SCORE_REQUIRED",
      `スコアは${max}以下である必要があります`,
      "error",
      { metadata: { max } }
    ),
  isInteger: createNumberRule(
    Number.isInteger,
    "INTEGER_REQUIRED",
    "スコアは整数である必要があります"
  ),
};

const getCacheKey = (value: number, rules: ScoreValidationRules): string => {
  return `${value}:${JSON.stringify(rules)}`;
};

const validateWithPerformance = (
  value: number,
  rule: ValidationRule<number>,
  startTime: number,
  context?: Record<string, unknown>
): { isValid: boolean; executionTime: number; error?: ValidationError } => {
  try {
    const start = performance.now();
    const isValid = rule.validate(value);
    const executionTime = performance.now() - start;

    if (!isValid) {
      return {
        isValid,
        executionTime,
        error: {
          message: rule.message,
          code: rule.code,
          severity: rule.severity,
          metadata: {
            timestamp: startTime,
            executionTime,
            ...context,
          },
        },
      };
    }

    return { isValid, executionTime };
  } catch (error: unknown) {
    console.error(`Validation error in rule ${rule.code}:`, error);
    const errorMessage =
      error instanceof Error ? error.message : "不明なエラー";
    return {
      isValid: false,
      executionTime: 0,
      error: {
        message: `バリデーション実行中にエラーが発生しました: ${errorMessage}`,
        code: "VALIDATION_ERROR",
        severity: "error",
        metadata: {
          timestamp: startTime,
          originalError: error,
          rule: rule.code,
        },
      },
    };
  }
};

const checkCache = (
  value: number,
  rules: ScoreValidationRules,
  startTime: number
): ValidationResult | null => {
  const cacheKey = getCacheKey(value, rules);
  const cachedResult = ruleResultCache.get(cacheKey);
  if (
    cachedResult?.metadata?.validatedAt &&
    startTime - cachedResult.metadata.validatedAt < CACHE_TTL
  ) {
    return cachedResult;
  }
  return null;
};

const validateBasicRule = (
  value: number,
  startTime: number
): { result: ValidationResult | null; executionTime: number } => {
  const { isValid, executionTime, error } = validateWithPerformance(
    value,
    SCORE_RULES.isValid,
    startTime
  );
  const ruleExecutionTimes = { [SCORE_RULES.isValid.code]: executionTime };

  if (!isValid) {
    return {
      result: {
        isValid: false,
        errors: error ? [error] : [],
        metadata: {
          validatedAt: startTime,
          rules: [SCORE_RULES.isValid.name],
          performance: {
            validationDuration: executionTime,
            ruleExecutionTimes,
          },
        },
      },
      executionTime,
    };
  }

  return { result: null, executionTime };
};

const getAdditionalRules = (
  rules: ScoreValidationRules
): ValidationRule<number>[] => [
  SCORE_RULES.isPositive,
  ...(rules.min != null ? [SCORE_RULES.createMinRule(rules.min)] : []),
  ...(rules.max != null ? [SCORE_RULES.createMaxRule(rules.max)] : []),
  ...(rules.isInteger ? [SCORE_RULES.isInteger] : []),
  ...(rules.customRules ?? []),
];

const validateAndCollectErrors = (
  value: number,
  rules: ValidationRule<number>[],
  startTime: number,
  metadata?: Record<string, unknown>
): {
  errors: ValidationError[];
  appliedRules: string[];
  ruleExecutionTimes: Record<string, number>;
} => {
  const errors: ValidationError[] = [];
  const appliedRules: string[] = [];
  const ruleExecutionTimes: Record<string, number> = {};

  for (const rule of rules) {
    const { isValid, executionTime, error } = validateWithPerformance(
      value,
      rule,
      startTime,
      metadata
    );

    ruleExecutionTimes[rule.code] = executionTime;
    if (!isValid && error) {
      errors.push(error);
      appliedRules.push(rule.name);
    }
  }

  return { errors, appliedRules, ruleExecutionTimes };
};

const handleCacheResult = (
  value: number,
  rules: ScoreValidationRules,
  result: ValidationResult,
  options: ErrorOptions
): ValidationResult => {
  if (options.cacheable) {
    ruleResultCache.set(getCacheKey(value, rules), result);
  }
  return result;
};

const validateAndProcessRules = (
  value: number,
  rules: ScoreValidationRules,
  startTime: number,
  baseExecutionTime: number
): ValidationResult => {
  const additionalRules = getAdditionalRules(rules);
  const { errors, appliedRules, ruleExecutionTimes } = validateAndCollectErrors(
    value,
    additionalRules,
    startTime,
    rules.metadata
  );
  ruleExecutionTimes[SCORE_RULES.isValid.code] = baseExecutionTime;

  return {
    isValid: errors.length === 0,
    errors,
    metadata: {
      validatedAt: startTime,
      rules: appliedRules,
      performance: {
        validationDuration: Date.now() - startTime,
        ruleExecutionTimes,
      },
    },
  };
};

const processValidationResult = (
  value: number,
  rules: ScoreValidationRules,
  options: ErrorOptions,
  startTime: number
): ValidationResult => {
  const { result: basicResult, executionTime: baseExecutionTime } =
    validateBasicRule(value, startTime);
  if (basicResult) return basicResult;

  return validateAndProcessRules(value, rules, startTime, baseExecutionTime);
};

const validateWithCache = (
  value: number,
  rules: ScoreValidationRules,
  options: ErrorOptions
): ValidationResult => {
  const startTime = Date.now();
  return (
    (options.cacheable && checkCache(value, rules, startTime)) ||
    handleCacheResult(
      value,
      rules,
      processValidationResult(value, rules, options, startTime),
      options
    )
  );
};

export const validateScore = (
  value: number,
  rules: ScoreValidationRules = {},
  options: ErrorOptions = {}
): ValidationResult => validateWithCache(value, rules, options);

export const isValidScore = (
  value: number,
  rules: ScoreValidationRules = {}
): boolean => {
  const { isValid } = validateScore(value, rules);
  return isValid;
};

export const createChartError = (
  code: ErrorCode,
  message: string,
  subjectName: string,
  options: ErrorOptions = {}
): ChartError => ({
  code,
  message,
  severity: options.severity ?? "error",
  subject: subjectName,
  details: options.details as Record<string, unknown> | undefined,
  context: {
    source: "system",
    category: "validation",
    timestamp: options.timestamp ?? Date.now(),
    fieldName: subjectName,
    value: options.details,
  },
});
