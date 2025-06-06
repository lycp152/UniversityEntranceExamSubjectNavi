/**
 * Spinnerコンポーネントのテストスイート
 *
 * @module spinner.test
 * @description
 * Spinnerコンポーネントの機能をテストします。
 * 以下の項目について検証します：
 * - コンポーネントの基本的なレンダリング
 * - プロパティの適用
 * - アクセシビリティ対応
 * - スタイルの適用
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Spinner } from './spinner';

describe('Spinner', () => {
  // 基本的なレンダリングテスト
  it('デフォルトのプロパティで正しくレンダリングされる', () => {
    render(<Spinner />);

    // デフォルトのメッセージが表示されていることを確認
    expect(screen.getByText('データを読み込んでいます...')).toBeInTheDocument();

    // スピナーが表示されていることを確認
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
  });

  // カスタムメッセージのテスト
  it('カスタムメッセージが正しく表示される', () => {
    const customMessage = 'カスタムメッセージ';
    render(<Spinner message={customMessage} />);

    expect(screen.getByText(customMessage)).toBeInTheDocument();
  });

  // サイズプロパティのテスト
  it('サイズプロパティが正しく適用される', () => {
    const { container } = render(<Spinner size="large" />);
    const svg = container.querySelector('svg');

    expect(svg).toHaveClass('w-12 h-12');
  });

  // カラープロパティのテスト
  it('カラープロパティが正しく適用される', () => {
    const { container } = render(<Spinner color="red" />);
    const svg = container.querySelector('svg');

    expect(svg).toHaveClass('fill-red-600');
  });

  // アクセシビリティのテスト
  it('アクセシビリティ属性が正しく設定されている', () => {
    render(<Spinner />);

    const spinner = screen.getByRole('status');
    expect(spinner).toHaveAttribute('aria-label', 'データを読み込み中');

    // スクリーンリーダー用のテキストが存在することを確認
    expect(screen.getByText('Loading...')).toHaveClass('sr-only');
  });

  // アニメーションのテスト
  it('アニメーションクラスが正しく適用されている', () => {
    const { container } = render(<Spinner />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('animate-spin');
  });

  // ダークモードのテスト
  it('ダークモードのスタイルが正しく適用される', () => {
    const { container } = render(<Spinner />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('dark:text-gray-600');
  });

  // 出力要素のテスト
  it('出力要素が正しく設定されている', () => {
    const { container } = render(<Spinner />);
    const output = container.querySelector('output');
    expect(output).toHaveClass('flex flex-col items-center justify-center py-12');
  });
});
