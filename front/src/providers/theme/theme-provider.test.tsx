/**
 * テーマプロバイダーのテストスイート
 *
 * @module theme-provider.test
 * @description
 * ThemeProviderコンポーネントの機能をテストします。
 * 主に以下の点を検証します：
 * - 子要素の正しいレンダリング
 * - プロバイダーの正常なマウント
 * - window.matchMediaの適切な動作
 */

import { describe, it, expect, beforeAll, vi } from 'vitest';
import { render } from '@testing-library/react';
import { ThemeProvider } from './theme-provider';

describe('ThemeProvider', () => {
  /**
   * テスト実行前のセットアップ
   * window.matchMediaのモック化を行い、
   * ブラウザのメディアクエリ機能をシミュレートします。
   */
  beforeAll(() => {
    // window.matchMediaのモック実装
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  /**
   * 子要素のレンダリングテスト
   * ThemeProvider内の子要素が正しく表示されることを確認します。
   */
  it('子要素が正しくレンダリングされる', () => {
    const { getByText } = render(
      <ThemeProvider>
        <div>Test Child</div>
      </ThemeProvider>
    );

    expect(getByText('Test Child')).toBeInTheDocument();
  });

  /**
   * プロバイダーのマウントテスト
   * ThemeProviderコンポーネントが正常にDOMにマウントされることを確認します。
   */
  it('ThemeProviderがマウントされる', () => {
    const { container } = render(
      <ThemeProvider>
        <div>Test Child</div>
      </ThemeProvider>
    );

    expect(container).toBeInTheDocument();
  });
});
