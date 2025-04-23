/**
 * ヘッダーコンポーネントのテスト
 *
 * @module header.test
 * @description
 * ヘッダーコンポーネントのテストを実装します。
 * 以下のテストケースをカバーします：
 * - ホームページでの表示
 * - ログインボタンの表示と機能
 * - ダークモードトグルの表示
 * - アクセシビリティの確認
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import Header from './header';

// next/navigationのモック
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
}));

describe('Header', () => {
  it('ホームページで正しく表示されること', () => {
    // ホームページのパスをモック
    vi.mocked(usePathname).mockReturnValue('/');

    render(<Header />);

    // ヘッダー要素の存在確認
    const header = screen.getByRole('banner');
    expect(header).toBeInTheDocument();

    // ロゴの存在確認
    const logo = screen.getByText('受験科目navi');
    expect(logo).toBeInTheDocument();

    // ホームページではリンクが無効化されていることを確認
    const homeLink = screen.getByRole('link', { name: 'ホームへ戻る' });
    expect(homeLink).toHaveClass('pointer-events-none');
  });

  it('ログインボタンが正しく表示されること', () => {
    render(<Header />);

    // ログインボタンの存在確認
    const loginButton = screen.getByText('ログイン・新規登録');
    expect(loginButton).toBeInTheDocument();
    expect(loginButton.closest('a')).toHaveAttribute('href', '/login');
  });

  it('ダークモードトグルが正しく表示されること', () => {
    render(<Header />);

    // ダークモードトグルの存在確認
    const modeToggle = screen.getByRole('button');
    expect(modeToggle).toBeInTheDocument();
  });

  it('アクセシビリティの要件を満たしていること', () => {
    render(<Header />);

    // ナビゲーションの存在確認
    const nav = screen.getByRole('navigation', { name: 'メインナビゲーション' });
    expect(nav).toBeInTheDocument();

    // ヘッダーのラベル確認
    const header = screen.getByRole('banner');
    expect(header).toHaveAttribute('aria-label', 'サイトヘッダー');

    // ホームリンクのラベル確認
    const homeLink = screen.getByRole('link', { name: 'ホームへ戻る' });
    expect(homeLink).toBeInTheDocument();
  });

  it('ホームページ以外でリンクが有効になっていること', () => {
    // ホームページ以外のパスをモック
    vi.mocked(usePathname).mockReturnValue('/login');

    render(<Header />);

    // ホームリンクが有効になっていることを確認
    const homeLink = screen.getByRole('link', { name: 'ホームへ戻る' });
    expect(homeLink).not.toHaveClass('pointer-events-none');
  });
});
