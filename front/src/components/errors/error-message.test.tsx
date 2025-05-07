import { render, screen } from '@testing-library/react';
import { ErrorMessage } from './error-message';
import { describe, it, expect } from 'vitest';

/**
 * ErrorMessageコンポーネントのテスト
 *
 * @module error-message.test
 * @description
 * ErrorMessageコンポーネントのテストを実行します。
 * 以下の項目を検証します：
 * - コンポーネントの基本的なレンダリング
 * - アクセシビリティ属性の存在
 * - エラーメッセージの表示
 * - スタイリングの適用
 */
describe('ErrorMessage', () => {
  it('コンポーネントが正しくレンダリングされること', () => {
    const testMessage = 'テストエラーメッセージ';
    render(<ErrorMessage message={testMessage} />);

    // エラーメッセージの存在確認
    const message = screen.getByText(testMessage);
    expect(message).toBeInTheDocument();
  });

  it('アクセシビリティ属性が正しく設定されていること', () => {
    render(<ErrorMessage message="テスト" />);

    // role属性の確認
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();

    // スクリーンリーダー用テキストの確認
    const srText = screen.getByText('エラー');
    expect(srText).toHaveClass('sr-only');
  });

  it('スタイリングが正しく適用されていること', () => {
    render(<ErrorMessage message="テスト" />);

    // コンテナのスタイリング確認
    const container = screen.getByRole('alert');
    expect(container).toHaveClass(
      'flex',
      'items-center',
      'p-4',
      'mt-4',
      'mb-4',
      'text-sm',
      'text-red-800',
      'rounded-lg',
      'bg-red-50',
      'dark:bg-gray-800',
      'dark:text-red-400'
    );

    // アイコンのスタイリング確認
    const icon = container.querySelector('svg');
    expect(icon).toHaveClass('flex-shrink-0', 'inline', 'w-4', 'h-4', 'me-3');
  });
});
