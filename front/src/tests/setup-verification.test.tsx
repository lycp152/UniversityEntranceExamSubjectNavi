/**
 * テストのサンプルファイル
 * VitestとReact Testing Libraryを使用した基本的なテストの例を示す
 *
 * @module example-test
 * @description
 * - 基本的なテストケースの例
 * - Reactコンポーネントのレンダリングテスト
 * - テストの構造と書き方のガイド
 *
 * @see {@link ../components/Example.tsx} テスト対象のコンポーネント
 * @see {@link ./setup.ts} テスト環境のセットアップ
 */

import { describe, it, expect } from 'vitest';
import { render, screen, waitFor, renderHook } from '@testing-library/react';
import { useRouter } from 'next/router';
import { renderWithProviders } from './utils/render-utils';
import { generateTestData } from './utils/data-utils';
import { AsyncLoadingComponent } from './components/async-loading-component';

describe('Example Test Suite', () => {
  describe('基本的なテストケース', () => {
    it('真偽値のテストが正しく動作すること', () => {
      expect(true).toBe(true);
    });
  });

  describe('Reactコンポーネントのテスト', () => {
    it('テキストが正しくレンダリングされること', () => {
      render(<div>Hello World</div>);
      expect(screen.getByText('Hello World')).toBeInTheDocument();
    });

    it('存在しないテキストがレンダリングされないこと', () => {
      render(<div>Hello World</div>);
      expect(screen.queryByText('Not Exist')).not.toBeInTheDocument();
    });
  });

  describe('モックの動作確認', () => {
    it('Next.jsルーターのモックが正しく動作すること', () => {
      const { result } = renderHook(() => useRouter());
      expect(result.current.push).toBeDefined();
      expect(result.current.replace).toBeDefined();
      expect(result.current.prefetch).toBeDefined();
    });
  });

  describe('テストユーティリティの動作確認', () => {
    it('renderWithProvidersが正しく動作すること', () => {
      const { container } = renderWithProviders(<div>Test</div>);
      expect(container).toBeInTheDocument();
    });

    it('generateTestDataが正しく動作すること', () => {
      const testData = generateTestData(3);
      expect(testData).toHaveLength(3);
      expect(testData[0]).toHaveProperty('id');
      expect(testData[0]).toHaveProperty('name');
      expect(testData[0]).toHaveProperty('value');
    });
  });

  describe('環境変数の動作確認', () => {
    it('環境変数が正しく設定されていること', () => {
      // NODE_ENVは常に設定されているはず
      expect(process.env.NODE_ENV).toBeDefined();

      // NEXT_PUBLIC_API_URLが.env.testの値と一致することを確認
      expect(process.env.NEXT_PUBLIC_API_URL).toBe('http://localhost:8080/api');
    });
  });

  describe('カスタムマッチャーの動作確認', () => {
    it('toBeInTheDocumentが正しく動作すること', () => {
      render(<div>Test</div>);
      expect(screen.getByText('Test')).toBeInTheDocument();
    });

    it('toHaveClassが正しく動作すること', () => {
      render(<div className="test-class">Test</div>);
      expect(screen.getByText('Test')).toHaveClass('test-class');
    });
  });

  describe('エラーハンドリングの確認', () => {
    it('エラーが正しくキャッチされること', () => {
      const ErrorComponent = () => {
        throw new Error('Test Error');
      };

      expect(() => render(<ErrorComponent />)).toThrow('Test Error');
    });
  });

  describe('非同期処理の確認', () => {
    it('非同期処理が正しく動作すること', async () => {
      render(<AsyncLoadingComponent />);
      expect(screen.queryByText('Loaded')).not.toBeInTheDocument();
      await waitFor(() => {
        expect(screen.getByText('Loaded')).toBeInTheDocument();
      });
    });
  });
});
