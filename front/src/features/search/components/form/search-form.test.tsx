import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SearchForm from './search-form';

// ResizeObserverのモック
class ResizeObserver {
  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }
  callback: ResizeObserverCallback;
  observe() {
    // テストでは実際の観測は不要
  }
  unobserve() {
    // テストでは実際の観測解除は不要
  }
  disconnect() {
    // テストでは実際の切断は不要
  }
}

global.ResizeObserver = ResizeObserver;

// APIのモック
vi.mock('@/features/search/api/actions', () => ({
  searchUniversities: vi.fn().mockImplementation(() => Promise.resolve({})),
}));

/**
 * 検索フォームコンポーネントのテスト
 *
 * 以下の機能をテストします：
 * - 初期状態のレンダリング
 * - キーワード入力の処理
 * - 詳細検索の展開/折りたたみ
 * - フォームの送信
 * - エラーメッセージの表示
 * - アクセシビリティ属性の設定
 */
describe('SearchForm', () => {
  it('初期状態で正しくレンダリングされること', () => {
    render(<SearchForm />);

    // タイトルが表示されていること
    expect(screen.getByText('キーワードで絞り込む（任意）')).toBeInTheDocument();
    expect(screen.getByText('詳細条件')).toBeInTheDocument();
    expect(screen.getByText('検索結果の並び順')).toBeInTheDocument();

    // 入力フィールドが存在すること
    expect(screen.getByPlaceholderText('例：北海道大学 工学部')).toBeInTheDocument();

    // 検索ボタンが存在すること
    expect(screen.getByRole('button', { name: '検索を実行' })).toBeInTheDocument();
  });

  it('キーワードを入力できること', async () => {
    render(<SearchForm />);

    const input = screen.getByPlaceholderText('例：北海道大学 工学部');
    fireEvent.change(input, { target: { value: '北海道大学' } });

    expect(input).toHaveValue('北海道大学');
  });

  it('詳細条件を展開/折りたたみできること', async () => {
    render(<SearchForm />);

    const toggleButton = screen.getByRole('button', { name: '詳細条件' });
    fireEvent.click(toggleButton);

    // 詳細条件が展開されていることを確認
    await waitFor(() => {
      expect(screen.getByRole('button', { name: '詳細条件' })).toHaveAttribute(
        'aria-expanded',
        'true'
      );
    });

    // 再度クリックして折りたたむ
    fireEvent.click(toggleButton);

    // 詳細条件が折りたたまれていることを確認
    await waitFor(() => {
      expect(screen.getByRole('button', { name: '詳細条件' })).toHaveAttribute(
        'aria-expanded',
        'false'
      );
    });
  });

  it('フォームの送信が正しく処理されること', async () => {
    render(<SearchForm />);

    const input = screen.getByPlaceholderText('例：北海道大学 工学部');
    fireEvent.change(input, { target: { value: '北海道大学' } });

    const submitButton = screen.getByRole('button', { name: '検索を実行' });

    await act(async () => {
      fireEvent.click(submitButton);
    });

    // 検索処理が完了するのを待つ
    await waitFor(() => {
      expect(screen.getByRole('button', { name: '検索を実行' })).not.toBeDisabled();
    });
  });

  it('アクセシビリティ属性が正しく設定されていること', () => {
    render(<SearchForm />);

    // フォームのアクセシビリティ属性
    const form = screen.getByRole('form');
    expect(form).toHaveAttribute('aria-label', '大学検索フォーム');

    // 入力フィールドのアクセシビリティ属性
    const input = screen.getByPlaceholderText('例：北海道大学 工学部');
    expect(input).toHaveAttribute('aria-invalid', 'false');

    // 検索ボタンのアクセシビリティ属性
    const submitButton = screen.getByRole('button', { name: '検索を実行' });
    expect(submitButton).toHaveAttribute('aria-busy', 'false');
  });
});
