/**
 * スタイルユーティリティのテスト
 *
 * @module style-utils.test
 * @description
 * - クラス名の結合の検証
 * - 条件付きクラス名の適用の検証
 * - スタイルの重複排除の検証
 *
 * @see {@link ./tailwind-utils.ts} スタイルユーティリティ
 */

import { describe, it, expect } from 'vitest';
import { cn } from './tailwind-utils';

describe('スタイルユーティリティの検証', () => {
  describe('クラス名の結合', () => {
    it('複数のクラス名を正しく結合する', () => {
      const result = cn('text-red-500', 'font-bold', 'p-4');
      expect(result).toBe('text-red-500 font-bold p-4');
    });

    it('空のクラス名を無視する', () => {
      const result = cn('text-red-500', '', 'p-4');
      expect(result).toBe('text-red-500 p-4');
    });

    it('undefinedやnullを無視する', () => {
      const result = cn('text-red-500', undefined, null, 'p-4');
      expect(result).toBe('text-red-500 p-4');
    });
  });

  describe('条件付きクラス名', () => {
    it('条件に基づいてクラス名を適用する', () => {
      const isActive = true;
      const result = cn('text-red-500', isActive && 'font-bold', 'p-4');
      expect(result).toBe('text-red-500 font-bold p-4');
    });

    it('条件がfalseの場合はクラス名を適用しない', () => {
      const isActive = false;
      const result = cn('text-red-500', isActive && 'font-bold', 'p-4');
      expect(result).toBe('text-red-500 p-4');
    });
  });

  describe('スタイルの重複排除', () => {
    it('同じプロパティのクラス名を重複排除する', () => {
      const result = cn('text-red-500', 'text-blue-500');
      expect(result).toBe('text-blue-500');
    });

    it('異なるプロパティのクラス名は重複排除しない', () => {
      const result = cn('text-red-500', 'font-bold');
      expect(result).toBe('text-red-500 font-bold');
    });

    it('複数の重複を正しく排除する', () => {
      const result = cn('text-red-500', 'text-blue-500', 'font-bold', 'font-normal');
      expect(result).toBe('text-blue-500 font-normal');
    });
  });

  describe('型安全性', () => {
    it('型チェックが正しく機能する', () => {
      const result = cn('text-red-500', undefined as any);
      expect(result).toBe('text-red-500');
    });

    it('配列のクラス名を正しく処理する', () => {
      const classes = ['text-red-500', 'font-bold'];
      const result = cn(...classes);
      expect(result).toBe('text-red-500 font-bold');
    });
  });
});
