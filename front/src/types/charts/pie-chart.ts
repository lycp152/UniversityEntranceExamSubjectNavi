import { SubjectType } from "@/constants/subjects2";
import type { SubjectScore } from "@/types/score";

// 基本的なチャートデータの型
export interface PieData {
  name: string;
  value: number;
  percentage: number;
}

export interface DetailedPieData extends PieData {
  category: string;
  displayName?: string;
  type: SubjectType;
}

export type ChartProps = {
  detailedData: SubjectScore[];
  outerData: SubjectScore[];
  isRightChart?: boolean;
};

export type CustomLabelProps = {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
  name: string;
  displayName?: string;
  isRightChart?: boolean;
};

export type PatternConfig = {
  color: string;
  pattern: {
    width: number;
    height: number;
    transform?: string;
    content: (color: string) => string;
  };
};

export type ChartError = {
  code: string;
  message: string;
  field?: string;
  severity?: "error" | "warning" | "info";
};

export type ChartResult<T> = {
  data: T[];
  errors: ChartError[];
  hasErrors: boolean;
  status: "success" | "error";
  metadata?: {
    processedAt: number;
    totalItems: number;
    successCount: number;
    errorCount: number;
  };
};
