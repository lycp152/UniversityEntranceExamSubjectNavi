import type { ChartError } from "@/types/charts";

export const useChartError = (errors: ChartError[]) => {
  return {
    errors,
    errorCount: errors.length,
    hasErrors: errors.length > 0,
  };
};
