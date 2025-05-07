import { render, screen } from '@testing-library/react';
import { EmptyState } from './empty-state';
import { describe, it, expect } from 'vitest';

/**
 * EmptyStateコンポーネントのテスト
 *
 * @module empty-state.test
 * @description
 * EmptyStateコンポーネントのテストを実行します。
 * 以下の項目を検証します：
 * - コンポーネントの基本的なレンダリング
 * - アクセシビリティ属性の存在
 * - アイコンの表示
 * - テキストの表示
 */
describe('EmptyState', () => {
  it('コンポーネントが正しくレンダリングされること', () => {
    render(<EmptyState />);

    // アイコンの存在確認
    const icon = screen.getByTestId('empty-state-icon');
    expect(icon).toBeInTheDocument();

    // タイトルの存在確認
    const title = screen.getByText('データが見つかりませんでした。');
    expect(title).toBeInTheDocument();

    // 説明文の存在確認
    const description = screen.getByText('現在、データベースに大学情報が登録されていません。');
    expect(description).toBeInTheDocument();
  });

  it('アクセシビリティ属性が正しく設定されていること', () => {
    render(<EmptyState />);

    // アイコンのdata-testid属性の確認
    const icon = screen.getByTestId('empty-state-icon');
    expect(icon).toHaveAttribute('data-testid', 'empty-state-icon');

    // タイトルのセマンティックな構造の確認
    const title = screen.getByRole('heading', { level: 3 });
    expect(title).toBeInTheDocument();
  });

  it('スタイリングが正しく適用されていること', () => {
    render(<EmptyState />);

    // コンテナのスタイリング確認
    const container = screen.getByTestId('empty-state-icon').parentElement;
    expect(container).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center', 'py-12');

    // アイコンのスタイリング確認
    const icon = screen.getByTestId('empty-state-icon');
    expect(icon).toHaveClass('w-12', 'h-12', 'text-gray-400', 'mb-4');

    // タイトルのスタイリング確認
    const title = screen.getByText('データが見つかりませんでした。');
    expect(title).toHaveClass('text-xl', 'text-gray-500', 'dark:text-gray-400');

    // 説明文のスタイリング確認
    const description = screen.getByText('現在、データベースに大学情報が登録されていません。');
    expect(description).toHaveClass('mt-2', 'text-gray-500', 'dark:text-gray-400');
  });
});
