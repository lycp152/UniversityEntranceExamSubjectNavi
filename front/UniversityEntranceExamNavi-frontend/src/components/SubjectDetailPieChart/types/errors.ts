import { ErrorCode } from "../constants/errorCodes";

export type ErrorSeverity = "error" | "warning" | "info";
export type ErrorCategory = "validation" | "runtime" | "system";
export type ErrorSource = "user" | "system" | "external";

export interface ErrorContext {
  source: ErrorSource;
  category: ErrorCategory;
  timestamp: number;
  traceId?: string;
}

export interface BaseError {
  code: ErrorCode;
  message: string;
  severity: ErrorSeverity;
  context: ErrorContext;
  details?: unknown;
}

export interface ValidationContext extends ErrorContext {
  fieldName: string;
  value: unknown;
  constraints?: {
    min?: number;
    max?: number;
    pattern?: string;
    required?: boolean;
  };
}

export interface ChartError extends BaseError {
  subjectName: string;
  context: ValidationContext;
}

export interface ValidationMetadata {
  processedAt: number;
  totalItems: number;
  successCount: number;
  errorCount: number;
  duration?: number;
  validationRules?: string[];
  performance?: {
    validationDuration: number;
    ruleExecutionTimes: Record<string, number>;
  };
}

export interface ChartResult<T> {
  data: T[];
  errors: ChartError[];
  hasErrors: boolean;
  metadata?: ValidationMetadata;
  status: "success" | "partial" | "failure";
}

export type ErrorHandler<T> = (error: ChartError) => T;

export interface ErrorHandlerOptions {
  shouldThrow?: boolean;
  logLevel?: "debug" | "info" | "warn" | "error";
  retryCount?: number;
  retryDelay?: number;
  fallback?: () => unknown;
}

export interface ErrorBoundary {
  catch: (error: unknown) => ChartError;
  handle: ErrorHandler<void>;
  recover?: () => void;
}

export type ValidationRule = {
  name: string;
  validate: (value: unknown, context?: ValidationContext) => boolean;
  message: string;
  severity: ErrorSeverity;
  category: ErrorCategory;
};
