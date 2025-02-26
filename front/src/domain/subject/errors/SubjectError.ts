export enum SubjectErrorCode {
  VALIDATION = 'VALIDATION_ERROR',
  CALCULATION = 'CALCULATION_ERROR',
  CACHE = 'CACHE_ERROR',
  METRICS = 'METRICS_ERROR',
  SYSTEM = 'SYSTEM_ERROR',
}

export interface SubjectErrorContext {
  code: SubjectErrorCode;
  timestamp: number;
  details?: Record<string, unknown>;
  originalError?: Error;
}

export class SubjectError extends Error {
  readonly code: SubjectErrorCode;
  readonly timestamp: number;
  readonly details?: Record<string, unknown>;

  constructor(message: string, context: SubjectErrorContext) {
    super(message);
    this.name = 'SubjectError';
    this.code = context.code;
    this.timestamp = context.timestamp;
    this.details = context.details;

    if (context.originalError && context.originalError instanceof Error) {
      this.stack = context.originalError.stack;
    }
  }

  static validation(message: string, details?: Record<string, unknown>): SubjectError {
    return new SubjectError(message, {
      code: SubjectErrorCode.VALIDATION,
      timestamp: Date.now(),
      details,
    });
  }

  static calculation(message: string, details?: Record<string, unknown>): SubjectError {
    return new SubjectError(message, {
      code: SubjectErrorCode.CALCULATION,
      timestamp: Date.now(),
      details,
    });
  }

  static cache(message: string, details?: Record<string, unknown>): SubjectError {
    return new SubjectError(message, {
      code: SubjectErrorCode.CACHE,
      timestamp: Date.now(),
      details,
    });
  }

  static metrics(message: string, details?: Record<string, unknown>): SubjectError {
    return new SubjectError(message, {
      code: SubjectErrorCode.METRICS,
      timestamp: Date.now(),
      details,
    });
  }

  static system(message: string, originalError?: Error): SubjectError {
    return new SubjectError(message, {
      code: SubjectErrorCode.SYSTEM,
      timestamp: Date.now(),
      originalError,
    });
  }
}
