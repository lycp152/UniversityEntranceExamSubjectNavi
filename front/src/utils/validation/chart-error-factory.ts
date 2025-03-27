import { ChartError } from "@/types/charts/pie-chart";
import { ChartErrorCode } from "@/constants/chart-error-codes";

export interface ErrorOptions {
  severity?: ChartError["severity"];
  details?: unknown;
  timestamp?: number;
  cacheable?: boolean;
}

export const createChartError = (
  code: ChartErrorCode,
  message: string,
  subjectName: string,
  options: ErrorOptions = {}
): ChartError => ({
  code,
  field: subjectName,
  message,
  severity: options.severity ?? "error",
});
