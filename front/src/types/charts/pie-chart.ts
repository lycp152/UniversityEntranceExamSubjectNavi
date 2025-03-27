import { EXAM_TYPES } from "@/constants/subjects";
import type { ErrorSeverity } from "@/lib/api/errors/categories";

// 基本的なチャートデータの型
export interface PieData {
  name: string;
  value: number;
  percentage: number;
}

export interface DetailedPieData extends PieData {
  category: string;
  displayName?: string;
  type: (typeof EXAM_TYPES)[keyof typeof EXAM_TYPES];
}

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
  severity: ErrorSeverity;
  subject: string;
  details?: Record<string, unknown>;
  context?: {
    source: string;
    category: string;
    timestamp: number;
    fieldName: string;
    value?: unknown;
  };
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

export type ChartData = {
  detailedData: DetailedPieData[];
  outerData: PieData[];
  errors: ChartError[];
};
