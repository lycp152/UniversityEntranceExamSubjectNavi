import { SubjectCategory } from '@/types/subject';

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
  category: SubjectCategory;
}

export const PIE_COMMON_PROPS = {
  dataKey: 'value',
  startAngle: 90,
  endAngle: -270,
} as const;
