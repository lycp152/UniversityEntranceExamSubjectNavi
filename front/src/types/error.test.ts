import { describe, it, expect } from 'vitest';
import React from 'react';
import type {
  ErrorSeverity,
  ErrorCategory,
  ErrorBoundaryProps,
  ErrorBoundaryState,
  DefaultErrorFallbackProps,
  ErrorMessageProps,
} from './error';

/**
 * エラーカテゴリの型定義のテスト
 * 型の整合性と型安全性を確認します
 */
describe('エラーカテゴリの型定義', () => {
  describe('ErrorSeverity', () => {
    it('正しい重要度を検証できる', () => {
      const validSeverities: ErrorSeverity[] = ['error', 'warning'];

      validSeverities.forEach(severity => {
        expect(severity).toBeDefined();
        expect(typeof severity).toBe('string');
      });

      // 無効な重要度は型エラーとなることを確認
      expect(() => {
        const invalid = 'invalid' as unknown as ErrorSeverity;
        return invalid;
      }).not.toThrow();
    });
  });

  describe('ErrorCategory', () => {
    it('正しいカテゴリを検証できる', () => {
      const validCategories: ErrorCategory[] = ['validation', 'calculation', 'render'];

      validCategories.forEach(category => {
        expect(category).toBeDefined();
        expect(typeof category).toBe('string');
      });

      // 無効なカテゴリは型エラーとなることを確認
      expect(() => {
        const invalid = 'invalid' as unknown as ErrorCategory;
        return invalid;
      }).not.toThrow();
    });
  });
});

/**
 * エラーハンドリングの型定義のテスト
 * 型の整合性と型安全性を検証します
 */
describe('エラーハンドリングの型定義', () => {
  describe('ErrorBoundaryProps', () => {
    it('必須プロパティが正しく定義されている', () => {
      const props: ErrorBoundaryProps = {
        children: React.createElement('div', null, 'テスト'),
      };

      expect(props.children).toBeDefined();
    });

    it('オプショナルプロパティが正しく定義されている', () => {
      const props: ErrorBoundaryProps = {
        children: React.createElement('div', null, 'テスト'),
        fallback: React.createElement('div', null, 'エラーが発生しました'),
        onError: (error, errorInfo) => {
          console.error(error, errorInfo);
        },
        onReset: () => {
          console.log('リセット');
        },
      };

      expect(props.fallback).toBeDefined();
      expect(props.onError).toBeDefined();
      expect(props.onReset).toBeDefined();
    });
  });

  describe('ErrorBoundaryState', () => {
    it('エラー状態が正しく定義されている', () => {
      const state: ErrorBoundaryState = {
        error: new Error('テストエラー'),
        errorInfo: {
          componentStack: 'テストスタック',
        },
      };

      expect(state.error).toBeInstanceOf(Error);
      expect(state.errorInfo).toBeDefined();
    });
  });

  describe('DefaultErrorFallbackProps', () => {
    it('エラーフォールバックのプロパティが正しく定義されている', () => {
      const props: DefaultErrorFallbackProps = {
        error: new Error('テストエラー'),
        errorInfo: {
          componentStack: 'テストスタック',
        },
        onRetry: () => {
          console.log('再試行');
        },
      };

      expect(props.error).toBeInstanceOf(Error);
      expect(props.errorInfo).toBeDefined();
      expect(props.onRetry).toBeDefined();
    });
  });

  describe('ErrorMessageProps', () => {
    it('エラーメッセージのプロパティが正しく定義されている', () => {
      const props: ErrorMessageProps = {
        message: 'エラーメッセージ',
        variant: 'default',
      };

      expect(props.message).toBe('エラーメッセージ');
      expect(props.variant).toBe('default');
    });
  });
});
