/**
 * エラースタイルのテスト
 *
 * @module error.test
 * @description
 * - エラースタイルの型安全性の検証
 * - スタイルの一貫性の確認
 * - バリアントの動作確認
 * - フォールバックスタイルの検証
 */

import { describe, it, expect } from 'vitest';
import { errorStyles, errorVariants, fallbackStyles } from './error';

describe('エラースタイルの検証', () => {
  describe('基本スタイル', () => {
    it('errorStylesの型が正しい', () => {
      expect(errorStyles.container).toBe('mb-6 p-4 rounded-lg');
      expect(errorStyles.message).toBe('text-sm');
      expect(errorStyles.icon).toBe('h-5 w-5 mr-2');
      expect(errorStyles.flex).toBe('flex items-center');
    });

    it('errorStylesの型が正しく定義されている', () => {
      const test: typeof errorStyles = {
        container: 'mb-6 p-4 rounded-lg',
        message: 'text-sm',
        icon: 'h-5 w-5 mr-2',
        flex: 'flex items-center',
      };
      expect(test).toBeDefined();
    });
  });

  describe('エラーバリアント', () => {
    it('デフォルトバリアントのスタイルが正しい', () => {
      expect(errorVariants.default.container).toBe('bg-red-50 border border-red-200');
      expect(errorVariants.default.message).toBe('text-red-600');
      expect(errorVariants.default.icon).toBe('text-red-400');
    });

    it('警告バリアントのスタイルが正しい', () => {
      expect(errorVariants.warning.container).toBe('bg-yellow-50 border border-yellow-200');
      expect(errorVariants.warning.message).toBe('text-yellow-600');
      expect(errorVariants.warning.icon).toBe('text-yellow-400');
    });

    it('バリアントの型が正しく定義されている', () => {
      const test: typeof errorVariants = {
        default: {
          container: 'bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800',
          message: 'text-red-600 dark:text-red-400',
          icon: 'text-red-400 dark:text-red-500',
        },
        warning: {
          container:
            'bg-yellow-50 dark:bg-yellow-950/50 border border-yellow-200 dark:border-yellow-800',
          message: 'text-yellow-600 dark:text-yellow-400',
          icon: 'text-yellow-400 dark:text-yellow-500',
        },
      };
      expect(test).toBeDefined();
    });
  });

  describe('フォールバックスタイル', () => {
    it('フォールバックスタイルの型が正しい', () => {
      expect(fallbackStyles.container).toBe(
        'min-h-screen flex items-center justify-center bg-gray-100'
      );
      expect(fallbackStyles.card).toBe('max-w-md w-full p-6 bg-white rounded-lg shadow-lg');
      expect(fallbackStyles.title).toBe('text-2xl font-bold mb-4');
      expect(fallbackStyles.message).toBe('text-gray-600 mb-4');
      expect(fallbackStyles.errorDetails).toBe('text-sm font-mono bg-gray-100 p-2 rounded');
      expect(fallbackStyles.errorStack).toBe(
        'text-xs font-mono bg-gray-100 p-2 mt-2 rounded overflow-auto'
      );
      expect(fallbackStyles.buttonContainer).toBe('flex justify-end');
    });

    it('フォールバックスタイルの型が正しく定義されている', () => {
      const test: typeof fallbackStyles = {
        container: 'min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900',
        card: 'w-full p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg',
        title: 'text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2',
        message: 'text-gray-600 dark:text-gray-300 mb-2',
        errorDetails:
          'text-sm font-mono bg-gray-100 dark:bg-gray-700 p-2 rounded text-gray-800 dark:text-gray-200',
        errorStack:
          'text-xs font-mono bg-gray-100 dark:bg-gray-700 p-2 mt-2 rounded overflow-auto text-gray-800 dark:text-gray-200',
        buttonContainer: 'flex justify-end',
      };
      expect(test).toBeDefined();
    });
  });
});
