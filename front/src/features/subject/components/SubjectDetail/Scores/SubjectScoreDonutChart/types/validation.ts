import { ErrorCategory, ErrorSeverity } from "./errors";

export interface ValidationContext {
  fieldName: string;
  value: unknown;
  timestamp: number;
}

export interface ValidationError {
  message: string;
  code: string;
  severity: ErrorSeverity;
  metadata?: Record<string, unknown>;
}

export type ValidationRule<T> = {
  name: string;
  validate: (value: T, context?: ValidationContext) => boolean;
  message: string;
  code: string;
  severity: ErrorSeverity;
  category: ErrorCategory;
  metadata?: Record<string, unknown>;
};

export interface ValidationMetadata {
  validatedAt: number;
  rules: string[];
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

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  metadata?: ValidationMetadata;
}

export interface ScoreValidationRules {
  min?: number;
  max?: number;
  isInteger?: boolean;
  customRules?: ValidationRule<number>[];
  metadata?: Record<string, unknown>;
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
