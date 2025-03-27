import { ErrorCategory, ErrorSeverity } from "@/lib/api/errors/categories";

export interface ValidationContext {
  fieldName: string;
  value: unknown;
  timestamp: number;
  [key: string]: unknown;
}

export interface ValidationError {
  message: string;
  code: string;
  severity: ErrorSeverity;
  field?: string;
  metadata?: Record<string, unknown>;
}

export type ValidationRule<T> = {
  name: string;
  validate: (
    value: T,
    context?: ValidationContext
  ) => boolean | Promise<boolean>;
  message: string;
  code: string;
  severity: ErrorSeverity;
  category: ErrorCategory;
  metadata?: Record<string, unknown>;
};

export interface ValidationMetadata {
  validatedAt: number;
  rules?: string[];
  processedAt?: number;
  totalItems?: number;
  successCount?: number;
  errorCount?: number;
  duration?: number;
  validationRules?: string[];
  performance?: {
    validationDuration: number;
    ruleExecutionTimes: Record<string, number>;
  };
}

export interface ValidationResult<T = unknown> {
  isValid: boolean;
  errors: ValidationError[];
  metadata?: ValidationMetadata;
  data?: T;
}

export const createValidationRule = <T>(
  validate: (value: T) => boolean,
  message: string,
  code: string,
  severity: ErrorSeverity = "error"
): ValidationRule<T> => ({
  name: code,
  validate,
  message,
  code,
  severity,
  category: "validation",
});

export type ScoreValidationRules = {
  commonTest: ValidationRule<number>[];
  secondTest: ValidationRule<number>[];
  total: ValidationRule<number>[];
  min?: number;
  max?: number;
  isInteger?: boolean;
  customRules?: ValidationRule<number>[];
  metadata?: Record<string, unknown>;
};
