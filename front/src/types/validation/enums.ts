export const enum ValidationSeverity {
  ERROR = "error",
  WARNING = "warning",
  INFO = "info",
}

export const enum ValidationCategory {
  REQUIRED = "required",
  FORMAT = "format",
  RANGE = "range",
  DEPENDENCY = "dependency",
  TIMEOUT = "timeout",
  SYSTEM = "system",
}
