import {
  ValidationCategory,
  ValidationErrorCode,
  ValidationSeverity,
} from "@/constants/validation";

export interface ValidationContext {
  fieldName: string;
  value: unknown;
  timestamp: number;
  [key: string]: unknown;
}

export interface ValidationError {
  field: string;
  message: string;
  code: ValidationErrorCode;
  severity: ValidationSeverity;
  metadata?: Record<string, unknown>;
}

export type ValidationRule<T> = {
  field: string;
  condition: (value: T) => boolean;
  message: string;
  code: ValidationErrorCode;
  severity: ValidationSeverity;
  category: ValidationCategory;
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
