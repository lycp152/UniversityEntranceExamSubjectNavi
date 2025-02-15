import { SubjectType } from '@/features/subject/constants';

// 基本的なチャートデータの型
export interface PieData {
  name: string;
  value: number;
  percentage: number; // 必須に統一
}

// 変換用の入力型
export interface TransformInput {
  value: number;
  totalScore: number;
  name: string;
}

// 科目スコアの基本型（表示用）
export type SubjectScore = PieData & {
  percentage: number;
  category: string; // パターン表示用のカテゴリ
  displayName?: string; // 表示用の名前
};

// 詳細なチャートデータの型
export interface DetailedPieData extends PieData {
  category: string;
  displayName?: string;
  type: SubjectType;
}

// ドーナツチャートのProps
export type ChartProps = {
  detailedData: SubjectScore[];
  outerData: SubjectScore[];
  isRightChart?: boolean;
};

// カスタムラベルのProps
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

// 表のデータ型
export type SubjectTableData = {
  subject: string;
  commonTest: {
    score: number;
    percentage: number;
  };
  secondaryTest: {
    score: number;
    percentage: number;
  };
  total: {
    score: number;
    percentage: number;
  };
};

// パターン設定の型
export type PatternConfig = {
  color: string;
  pattern: {
    width: number;
    height: number;
    transform?: string;
    content: (color: string) => string;
  };
};

// ChartResultの型定義
export type ChartResult<T> = {
  data: T[];
  errors: any[];
  hasErrors: boolean;
  status: 'success' | 'error';
  metadata?: {
    processedAt: number;
    totalItems: number;
    successCount: number;
    errorCount: number;
  };
};

// エラー関連の型
export type ErrorSeverity = 'error' | 'warning' | 'info';

export type ChartError = {
  code: string;
  message: string;
  subject: string;
  severity: ErrorSeverity;
  details?: Record<string, unknown>;
};

// スコア抽出結果の型
export type ExtractedScore = {
  type: 'success' | 'error';
  subjectName: string;
  value?: number;
  message?: string;
};
