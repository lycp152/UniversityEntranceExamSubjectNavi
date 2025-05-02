import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ErrorBoundary } from './error-boundary';

// エラーを発生させるテスト用コンポーネント
const ErrorComponent = () => {
  throw new Error('テストエラー');
};

describe('ErrorBoundary', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // コンソールエラーを抑制
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // モックをクリーンアップ
    consoleErrorSpy.mockRestore();
    vi.clearAllMocks();
  });

  it('エラーが発生した場合、フォールバックUIを表示する', () => {
    render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    );

    // エラーメッセージが表示されていることを確認
    expect(screen.getByText('エラーが発生しました')).toBeInTheDocument();
  });

  it('カスタムフォールバックUIが指定された場合、それを表示する', () => {
    const CustomFallback = () => <div>カスタムエラー表示</div>;

    render(
      <ErrorBoundary fallback={<CustomFallback />}>
        <ErrorComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('カスタムエラー表示')).toBeInTheDocument();
  });

  it('リトライボタンをクリックすると、エラー状態がリセットされる', () => {
    const onReset = vi.fn();
    render(
      <ErrorBoundary onReset={onReset}>
        <ErrorComponent />
      </ErrorBoundary>
    );

    // リトライボタンをクリック
    act(() => {
      fireEvent.click(screen.getByText('再試行'));
    });

    // onResetが呼び出されたことを確認
    expect(onReset).toHaveBeenCalled();
  });

  it('エラーが発生した場合、onErrorコールバックが呼び出される', () => {
    const onError = vi.fn();
    render(
      <ErrorBoundary onError={onError}>
        <ErrorComponent />
      </ErrorBoundary>
    );

    // onErrorが呼び出されたことを確認
    expect(onError).toHaveBeenCalled();
  });

  it('エラーが発生していない場合、子コンポーネントを表示する', () => {
    const NormalComponent = () => <div>正常なコンポーネント</div>;

    render(
      <ErrorBoundary>
        <NormalComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('正常なコンポーネント')).toBeInTheDocument();
  });

  it('エラー情報が正しく記録される', () => {
    const onError = vi.fn();
    render(
      <ErrorBoundary onError={onError}>
        <ErrorComponent />
      </ErrorBoundary>
    );

    // エラーオブジェクトの基本的なプロパティを確認
    const errorCall = onError.mock.calls[0];
    expect(errorCall[0]).toBeInstanceOf(Error);
    expect(errorCall[0].message).toBe('テストエラー');
    expect(errorCall[1]).toHaveProperty('componentStack');
    expect(typeof errorCall[1].componentStack).toBe('string');
  });
});
