import { z } from 'zod';
import { ValidationError } from '@/lib/validation/types';
import { API_ERROR_CODES, ERROR_MESSAGES } from '@/constants/domain-error-codes';
import { ValidationSeverity, ValidationErrorCode } from '@/lib/validation/constants';

export class ValidationException extends Error {
  readonly code: string;
  readonly errors: ValidationError[];

  constructor(errors: ValidationError[]) {
    super(ERROR_MESSAGES[API_ERROR_CODES.API_VALIDATION_ERROR]);
    this.name = 'ValidationException';
    this.code = API_ERROR_CODES.API_VALIDATION_ERROR;
    this.errors = errors;
  }
}

export const handleZodError = (error: z.ZodError): ValidationException => {
  const validationErrors = error.errors.map(
    (err): ValidationError => ({
      code: ValidationErrorCode.INVALID_DATA_FORMAT,
      message: err.message,
      field: err.path.join('.'),
      severity: ValidationSeverity.ERROR,
    })
  );

  return new ValidationException(validationErrors);
};

export const validateApiResponse = async <T>(schema: z.ZodType<T>, data: unknown): Promise<T> => {
  try {
    return await schema.parseAsync(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw handleZodError(error);
    }
    throw error;
  }
};
