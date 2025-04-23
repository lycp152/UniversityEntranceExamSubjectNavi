import { describe, it, expect } from 'vitest';
import {
  CHART_ERROR_CODES,
  CHART_ERROR_SEVERITY,
  CHART_ERROR_MESSAGES,
  type ChartErrorCode,
  type ChartErrorSeverity,
  type ChartErrorMessage,
} from './chart';

/**
 * チャートエラー関連の定数と型定義のテスト
 * バックエンドの実装との整合性を確認します
 * @see back/internal/domain/models/models.go
 */
describe('チャートエラー関連の定数と型定義', () => {
  describe('エラーコードの定義', () => {
    it('データ変換エラー関連のコードが正しく定義されている', () => {
      expect(CHART_ERROR_CODES.TRANSFORM_ERROR).toBe('TRANSFORM_ERROR');
      expect(CHART_ERROR_CODES.INVALID_DATA_FORMAT).toBe('INVALID_DATA_FORMAT');
      expect(CHART_ERROR_CODES.MISSING_REQUIRED_FIELD).toBe('MISSING_REQUIRED_FIELD');
    });

    it('計算エラー関連のコードが正しく定義されている', () => {
      expect(CHART_ERROR_CODES.CALCULATION_ERROR).toBe('CALCULATION_ERROR');
      expect(CHART_ERROR_CODES.INVALID_PERCENTAGE).toBe('INVALID_PERCENTAGE');
      expect(CHART_ERROR_CODES.TOTAL_EXCEEDED).toBe('TOTAL_EXCEEDED');
    });

    it('表示エラー関連のコードが正しく定義されている', () => {
      expect(CHART_ERROR_CODES.RENDER_ERROR).toBe('RENDER_ERROR');
      expect(CHART_ERROR_CODES.INVALID_DIMENSIONS).toBe('INVALID_DIMENSIONS');
      expect(CHART_ERROR_CODES.OVERFLOW_ERROR).toBe('OVERFLOW_ERROR');
    });
  });

  describe('エラーの重要度マッピング', () => {
    it('データ変換エラー関連の重要度が正しく設定されている', () => {
      expect(CHART_ERROR_SEVERITY.TRANSFORM_ERROR).toBe('error');
      expect(CHART_ERROR_SEVERITY.INVALID_DATA_FORMAT).toBe('error');
      expect(CHART_ERROR_SEVERITY.MISSING_REQUIRED_FIELD).toBe('error');
    });

    it('計算エラー関連の重要度が正しく設定されている', () => {
      expect(CHART_ERROR_SEVERITY.CALCULATION_ERROR).toBe('error');
      expect(CHART_ERROR_SEVERITY.INVALID_PERCENTAGE).toBe('error');
      expect(CHART_ERROR_SEVERITY.TOTAL_EXCEEDED).toBe('error');
    });

    it('表示エラー関連の重要度が正しく設定されている', () => {
      expect(CHART_ERROR_SEVERITY.RENDER_ERROR).toBe('warning');
      expect(CHART_ERROR_SEVERITY.INVALID_DIMENSIONS).toBe('warning');
      expect(CHART_ERROR_SEVERITY.OVERFLOW_ERROR).toBe('warning');
    });
  });

  describe('エラーメッセージの定義', () => {
    it('データ変換エラー関連のメッセージが正しく定義されている', () => {
      expect(CHART_ERROR_MESSAGES.TRANSFORM_ERROR).toBe('データの変換中にエラーが発生しました');
      expect(CHART_ERROR_MESSAGES.INVALID_DATA_FORMAT).toBe('データの形式が不正です');
      expect(CHART_ERROR_MESSAGES.MISSING_REQUIRED_FIELD).toBe('必須フィールドが不足しています');
    });

    it('計算エラー関連のメッセージが正しく定義されている', () => {
      expect(CHART_ERROR_MESSAGES.CALCULATION_ERROR).toBe('計算中にエラーが発生しました');
      expect(CHART_ERROR_MESSAGES.INVALID_PERCENTAGE).toBe(
        'パーセンテージの値が不正です（0-100の範囲）'
      );
      expect(CHART_ERROR_MESSAGES.TOTAL_EXCEEDED).toBe('合計値が上限を超えています');
    });

    it('表示エラー関連のメッセージが正しく定義されている', () => {
      expect(CHART_ERROR_MESSAGES.RENDER_ERROR).toBe('チャートの描画中にエラーが発生しました');
      expect(CHART_ERROR_MESSAGES.INVALID_DIMENSIONS).toBe('チャートのサイズが不正です');
      expect(CHART_ERROR_MESSAGES.OVERFLOW_ERROR).toBe('データが表示可能な範囲を超えています');
    });
  });

  describe('型定義の検証', () => {
    it('ChartErrorCode型が正しく定義されている', () => {
      const validCode: ChartErrorCode = 'TRANSFORM_ERROR';
      expect(validCode).toBeDefined();
    });

    it('ChartErrorSeverity型が正しく定義されている', () => {
      const validSeverity: ChartErrorSeverity = 'error';
      expect(validSeverity).toBeDefined();
    });

    it('ChartErrorMessage型が正しく定義されている', () => {
      const validMessage: ChartErrorMessage = 'データの変換中にエラーが発生しました';
      expect(validMessage).toBeDefined();
    });
  });
});
