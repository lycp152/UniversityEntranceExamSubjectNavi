import { ExamType } from "@/constants/subjects";
import {
  ChartErrorCode,
  ChartErrorSeverity,
} from "@/constants/chart-error-codes";

// 基本的なチャートデータの型
export interface PieData {
  name: string;
  value: number;
  percentage: number;
}

export interface DetailedPieData extends PieData {
  category: string;
  displayName?: string;
  type: ExamType;
  testTypeId: number;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  version: number;
  createdBy: string;
  updatedBy: string;
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

// バックエンドのValidationError構造体と一致
export type ChartError = {
  code: ChartErrorCode;
  field: string;
  message: string;
  severity: ChartErrorSeverity;
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
