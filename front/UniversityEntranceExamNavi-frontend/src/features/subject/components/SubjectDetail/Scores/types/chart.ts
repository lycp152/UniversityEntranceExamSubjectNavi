import { ChartScore } from './score';

export interface ChartData {
  detailedData: ChartScore[];
  outerData: ChartScore[];
}

export interface ChartProps {
  detailedData: ChartScore[];
  outerData: ChartScore[];
  isRightChart?: boolean;
}

export interface CustomLabelProps {
  x: number;
  y: number;
  name: string;
  value: number;
  percentage: number;
  isRight?: boolean;
}
