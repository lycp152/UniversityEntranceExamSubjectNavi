import type { DetailedPieData, PieData, ChartError } from "./charts/pie-chart";

export type { DetailedPieData, PieData, ChartError };

export type ChartData = {
  detailedData: DetailedPieData[];
  outerData: PieData[];
  errors: ChartError[];
};
