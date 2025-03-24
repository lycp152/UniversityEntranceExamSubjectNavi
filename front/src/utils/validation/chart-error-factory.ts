import { ErrorCode } from "@/types/errors/error-codes";
import { ChartError } from "@/types/errors/charts";

export interface ErrorOptions {
  severity?: ChartError["severity"];
  details?: unknown;
  timestamp?: number;
  cacheable?: boolean;
}

export const createChartError = (
  code: ErrorCode,
  message: string,
  subjectName: string,
  options: ErrorOptions = {}
): ChartError => ({
  code,
  message,
  severity: options.severity ?? "error",
  subject: subjectName,
  details: options.details as Record<string, unknown> | undefined,
  context: {
    source: "system",
    category: "validation",
    timestamp: options.timestamp ?? Date.now(),
    fieldName: subjectName,
    value: options.details,
  },
});
