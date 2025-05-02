import { render, screen, fireEvent } from '@testing-library/react';
import { DefaultErrorFallback } from './error-fallback';
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';

describe('DefaultErrorFallback', () => {
  const mockOnRetry = vi.fn();
  const mockErrorInfo = { componentStack: 'テストスタックトレース' };

  beforeAll(() => {
    vi.stubEnv('NODE_ENV', 'test');
  });

  afterAll(() => {
    vi.unstubAllEnvs();
  });

  it('ネットワークエラー時に適切なメッセージとスタイルを表示する', () => {
    const networkError = new TypeError('Failed to fetch');
    render(
      <DefaultErrorFallback error={networkError} errorInfo={mockErrorInfo} onRetry={mockOnRetry} />
    );

    // エラーメッセージの確認
    expect(
      screen.getByText('ネットワークエラーが発生しました。インターネット接続を確認してください。')
    ).toBeInTheDocument();

    // アイコンの確認
    expect(screen.getByText('🌐')).toBeInTheDocument();

    // アクセシビリティ属性の確認
    const alert = screen.getByRole('alert');
    expect(alert).toHaveAttribute('aria-live', 'assertive');
    expect(alert).toHaveAttribute('aria-atomic', 'true');

    // スタイルの確認
    expect(alert).toHaveClass('bg-yellow-50');
    expect(alert).toHaveClass('hover:bg-yellow-100');

    // カード要素のスタイル確認
    const card = screen.getByRole('alert').querySelector('[class*="border-yellow-200"]');
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass('border-2');
  });

  it('タイムアウトエラー時に適切なメッセージとスタイルを表示する', () => {
    const timeoutError = new DOMException('', 'AbortError');
    render(
      <DefaultErrorFallback error={timeoutError} errorInfo={mockErrorInfo} onRetry={mockOnRetry} />
    );

    expect(
      screen.getByText('リクエストがタイムアウトしました。もう一度お試しください。')
    ).toBeInTheDocument();
    expect(screen.getByText('⏱️')).toBeInTheDocument();

    // スタイルの確認
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('bg-orange-50');
    expect(alert).toHaveClass('hover:bg-orange-100');

    // カード要素のスタイル確認
    const card = screen.getByRole('alert').querySelector('[class*="border-orange-200"]');
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass('border-2');
  });

  it('その他のエラー時に適切なメッセージとスタイルを表示する', () => {
    const otherError = new Error('予期せぬエラー');
    render(
      <DefaultErrorFallback error={otherError} errorInfo={mockErrorInfo} onRetry={mockOnRetry} />
    );

    expect(
      screen.getByText('申し訳ありませんが、予期せぬエラーが発生しました。')
    ).toBeInTheDocument();
    expect(screen.getByText('⚠️')).toBeInTheDocument();

    // スタイルの確認
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('bg-red-50');
    expect(alert).toHaveClass('hover:bg-red-100');

    // カード要素のスタイル確認
    const card = screen.getByRole('alert').querySelector('[class*="border-red-200"]');
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass('border-2');
  });

  it('再試行ボタンがクリックされた時にonRetryが呼ばれる', () => {
    const error = new Error('テストエラー');
    render(<DefaultErrorFallback error={error} errorInfo={mockErrorInfo} onRetry={mockOnRetry} />);

    const retryButton = screen.getByRole('button', { name: '再試行' });
    fireEvent.click(retryButton);
    expect(mockOnRetry).toHaveBeenCalledTimes(1);
  });

  it('開発環境でエラー詳細が表示される', () => {
    vi.stubEnv('NODE_ENV', 'development');

    const error = new Error('テストエラー');
    const errorInfo = { componentStack: 'テストスタックトレース' };

    render(<DefaultErrorFallback error={error} errorInfo={errorInfo} onRetry={mockOnRetry} />);

    expect(screen.getByText('テストエラー')).toBeInTheDocument();
    expect(screen.getByText('テストスタックトレース')).toBeInTheDocument();
  });

  it('本番環境でエラー詳細が表示されない', () => {
    vi.stubEnv('NODE_ENV', 'production');

    const error = new Error('テストエラー');
    const errorInfo = { componentStack: 'テストスタックトレース' };

    render(<DefaultErrorFallback error={error} errorInfo={errorInfo} onRetry={mockOnRetry} />);

    expect(screen.queryByText('テストエラー')).not.toBeInTheDocument();
    expect(screen.queryByText('テストスタックトレース')).not.toBeInTheDocument();
  });
});
