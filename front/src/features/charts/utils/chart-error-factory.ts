/**
 * チャートエラーファクトリ
 * チャート表示に関するエラーを生成
 *
 * @module chart-error-factory
 * @description
 * - チャートエラーの生成
 * - エラーオプションの管理
 * - エラー詳細の設定
 */

import { ChartError } from '@/types/pie-chart';
import { ChartErrorCode } from '@/constants/errors/chart';

/**
 * エラーオプションのインターフェース
 */
export interface ErrorOptions {
  severity?: ChartError['severity'];
  details?: unknown;
}

/**
 * チャートエラーを生成
 * @param code - エラーコード
 * @param message - エラーメッセージ
 * @param subjectName - 科目名
 * @param options - エラーオプション
 * @returns チャートエラーオブジェクト
 * @example
 * createChartError(
 *   ChartErrorCode.INVALID_DATA,
 *   "データが無効です",
 *   "英語",
 *   { severity: "error" }
 * )
 */
export const createChartError = (
  code: ChartErrorCode,
  message: string,
  subjectName: string,
  options: ErrorOptions = {}
): ChartError => ({
  code,
  field: subjectName,
  message,
  severity: options.severity ?? 'error',
});
