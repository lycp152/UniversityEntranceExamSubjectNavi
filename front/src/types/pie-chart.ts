/**
 * 円グラフの型定義
 * 円グラフのデータ構造と表示に関する型定義を管理
 *
 * @module pie-chart
 * @description
 * - 基本的なチャートデータの型定義
 * - 詳細なチャートデータの型定義
 * - カスタムラベルのプロパティ型定義
 * - パターン設定の型定義
 * - エラー処理と結果の型定義
 */

import { ExamType } from '@/constants/constraint/exam-types';
import { ChartErrorCode, ChartErrorSeverity } from '@/constants/errors/chart';

/** 基本的なチャートデータの型 */
export interface PieData {
  /** データの名称 */
  name: string;
  /** データの値 */
  value: number;
  /** データの割合（0-100%） */
  percentage: number;
}

/** 詳細なチャートデータの型 */
export interface DetailedPieData extends PieData {
  /** データのカテゴリ */
  category: string;
  /** UI表示用の名称 */
  displayName?: string;
  /** データの試験種別 */
  type: ExamType;
  /** 関連するテストタイプのID */
  testTypeId: number;
  /** UI表示時の順序 */
  displayOrder: number;
  /** レコードの作成日時 */
  createdAt: string;
  /** レコードの更新日時 */
  updatedAt: string;
  /** レコードの削除日時 */
  deletedAt?: string;
  /** レコードのバージョン（楽観的ロック用） */
  version: number;
  /** レコードの作成者ID */
  createdBy: string;
  /** レコードの更新者ID */
  updatedBy: string;
}

/** カスタムラベルのプロパティ型 */
export type CustomLabelProps = {
  /** 円の中心X座標 */
  cx: number;
  /** 円の中心Y座標 */
  cy: number;
  /** セグメントの中心角 */
  midAngle: number;
  /** 円の内半径 */
  innerRadius: number;
  /** 円の外半径 */
  outerRadius: number;
  /** セグメントの割合（0-1） */
  percent: number;
  /** ラベルの名称 */
  name: string;
  /** UI表示用の名称 */
  displayName?: string;
  /** 右側のチャートかどうか */
  isRightChart?: boolean;
};

/** チャートエラーの型 */
export type ChartError = {
  /** エラーの一意のコード */
  code: ChartErrorCode;
  /** エラーが発生したフィールド名 */
  field: string;
  /** エラーの説明メッセージ */
  message: string;
  /** エラーの重要度レベル */
  severity: ChartErrorSeverity;
  /** エラーの詳細情報 */
  details?: unknown;
};

/** チャート結果の型 */
export type ChartResult<T> = {
  /** 処理されたチャートデータ */
  data: T[];
  /** 処理中のエラー情報 */
  errors: ChartError[];
  /** エラーの有無 */
  hasErrors: boolean;
  /** 処理の状態 */
  status: 'success' | 'error';
  /** 処理のメタデータ */
  metadata?: {
    /** 処理実行日時 */
    processedAt: number;
    /** 処理対象の総アイテム数 */
    totalItems: number;
    /** 処理成功数 */
    successCount: number;
    /** 処理エラー数 */
    errorCount: number;
  };
};

/** チャートデータの型 */
export type ChartData = {
  /** 詳細なデータ配列 */
  detailedData: DetailedPieData[];
  /** 集計されたデータ配列 */
  outerData: PieData[];
  /** データ処理中のエラー情報 */
  errors: ChartError[];
};
