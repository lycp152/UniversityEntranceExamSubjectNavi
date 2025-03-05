export class SubjectError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'SubjectError';
  }

  static validation(message: string, details?: Record<string, unknown>): SubjectError {
    return new SubjectError(message, 'VALIDATION_ERROR', details);
  }

  static calculation(message: string, details?: Record<string, unknown>): SubjectError {
    return new SubjectError(message, 'CALCULATION_ERROR', details);
  }

  static cache(message: string, details?: Record<string, unknown>): SubjectError {
    return new SubjectError(message, 'CACHE_ERROR', details);
  }
}
