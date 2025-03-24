import { SubjectName } from "@/types/subjects";

export interface CustomLabelProps {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
  name: string;
  displayName?: string;
  isRightChart: boolean;
}

export interface DetailedPieData {
  name: string;
  value: number;
  category: SubjectName;
}

export const PIE_COMMON_PROPS = {
  dataKey: "value",
  startAngle: 90,
  endAngle: -270,
} as const;
