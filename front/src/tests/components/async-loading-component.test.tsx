import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AsyncLoadingComponent } from './async-loading-component';

/**
 * 非同期ローディングコンポーネントのテスト
 * @description
 * - ローディング状態の遷移を検証
 * - データの表示を確認
 * - スタイリングの一貫性を確認
 */
describe('AsyncLoadingComponent', () => {
  it('初期状態でローディングスピナーが表示される', () => {
    render(<AsyncLoadingComponent />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('非同期処理後にデータが表示される', async () => {
    render(<AsyncLoadingComponent />);

    await waitFor(
      () => {
        expect(screen.getByText('Loaded')).toBeInTheDocument();
      },
      { timeout: 200 }
    );
  });

  it('ローディング完了後にスピナーが非表示になる', async () => {
    render(<AsyncLoadingComponent />);

    await waitFor(
      () => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      },
      { timeout: 200 }
    );
  });

  it('コンポーネントのスタイリングが正しく適用されている', () => {
    render(<AsyncLoadingComponent />);
    const container = screen.getByTestId('async-loading-component');

    expect(container).toHaveClass('flex');
    expect(container).toHaveClass('items-center');
    expect(container).toHaveClass('space-x-2');
  });
});
