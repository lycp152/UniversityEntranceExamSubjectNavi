export type ErrorSeverity = "error" | "warning" | "info";

export type ChartError = {
  code: string;
  message: string;
  subject: string;
  severity: ErrorSeverity;
  details?: Record<string, unknown>;
  context?: {
    source: string;
    category: string;
    timestamp: number;
    fieldName: string;
    value?: unknown;
  };
};
