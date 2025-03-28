import { ValidationRule } from "@/types/validation-rules";

export const enum ValidationSeverity {
  ERROR = "error",
  WARNING = "warning",
  INFO = "info",
}

export const enum ValidationCategory {
  TRANSFORM = "transform",
  FORMAT = "format",
  REQUIRED = "required",
  CALCULATION = "calculation",
  RENDER = "render",
}

export const enum ValidationErrorCode {
  // データ変換エラー
  TRANSFORM_ERROR = "TRANSFORM_ERROR",
  INVALID_DATA_FORMAT = "INVALID_DATA_FORMAT",
  MISSING_REQUIRED_FIELD = "MISSING_REQUIRED_FIELD",

  // 計算エラー
  CALCULATION_ERROR = "CALCULATION_ERROR",
  INVALID_PERCENTAGE = "INVALID_PERCENTAGE",
  TOTAL_EXCEEDED = "TOTAL_EXCEEDED",

  // 表示エラー
  RENDER_ERROR = "RENDER_ERROR",
  INVALID_DIMENSIONS = "INVALID_DIMENSIONS",
  OVERFLOW_ERROR = "OVERFLOW_ERROR",
}

export const createValidationRule = <T>(
  field: string,
  condition: (value: T) => boolean,
  message: string,
  code: ValidationErrorCode,
  severity: ValidationSeverity = ValidationSeverity.ERROR,
  category: ValidationCategory = ValidationCategory.TRANSFORM
): ValidationRule<T> => ({
  field,
  condition,
  message,
  code,
  severity,
  category,
});
