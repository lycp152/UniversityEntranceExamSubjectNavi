export interface PieData {
  name: string;
  value: number;
  percentage?: number;
}

export interface DetailedPieData extends PieData {
  category: string;
  displayName?: string;
}

export const PIE_COMMON_PROPS = {
  cx: "50%",
  cy: "50%",
  labelLine: false,
  startAngle: 90,
  endAngle: -270,
  dataKey: "value",
} as const;

export interface ChartData {
  detailedData: DetailedPieData[];
  outerData: PieData[];
}
