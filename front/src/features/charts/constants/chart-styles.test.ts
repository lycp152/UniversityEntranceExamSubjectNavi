/**
 * チャートスタイルのテスト
 *
 * @remarks
 * - 定数の値の検証
 * - スタイルの適用確認
 * - アクセシビリティの検証
 */
import { describe, it, expect } from 'vitest';
import { containerStyles, containerClassName, chartStyles } from './chart-styles';

describe('chart-styles', () => {
  describe('containerStyles', () => {
    it('WebkitTapHighlightColorがtransparentであること', () => {
      expect(containerStyles.WebkitTapHighlightColor).toBe('transparent');
    });
  });

  describe('containerClassName', () => {
    it('適切なクラス名が設定されていること', () => {
      expect(containerClassName).toBe('w-full min-h-[400px] bg-transparent');
    });
  });

  describe('chartStyles', () => {
    it('チャートの基本スタイルが含まれていること', () => {
      expect(chartStyles).toContain('.recharts-wrapper');
      expect(chartStyles).toContain('background-color: transparent');
    });

    it('円グラフのセクタースタイルが含まれていること', () => {
      expect(chartStyles).toContain('.recharts-pie-sector path');
      expect(chartStyles).toContain('stroke: white');
      expect(chartStyles).toContain('stroke-width: 2');
    });

    it('フォーカス時のスタイルが含まれていること', () => {
      expect(chartStyles).toContain(':focus-visible');
      expect(chartStyles).toContain('outline: 2px solid #2563eb');
      expect(chartStyles).toContain('outline-offset: 2px');
    });

    it('不要なアウトラインの削除が含まれていること', () => {
      expect(chartStyles).toContain('outline: none');
    });
  });
});
