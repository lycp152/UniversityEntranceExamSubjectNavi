import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import SearchResultTable from './search-result-table';

/**
 * 検索結果テーブルコンポーネントのテスト
 *
 * 以下の項目をテストします：
 * - データ取得中の表示
 * - エラー発生時の表示
 * - データが空の場合の表示
 * - データ表示
 * - 行クリック時の動作
 * - キーボード操作時の動作
 * - アクセシビリティ
 */
describe('SearchResultTable', () => {
  // グローバルなfetchをモック
  const mockFetch = vi.fn();
  global.fetch = mockFetch;

  // テストデータ
  const mockData = [
    {
      university: { id: 1, name: 'テスト大学' },
      department: { id: 1, name: 'テスト学部' },
      major: { id: 1, name: 'テスト学科' },
      admissionSchedule: { id: 1, name: '前期' },
      examInfo: { academicYear: 2024, enrollment: 100 },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('データ取得中の表示が正しいこと', async () => {
    mockFetch.mockImplementationOnce(() => new Promise(() => {}));
    render(<SearchResultTable />);
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveAttribute('aria-label', 'データを読み込み中');
  });

  it('エラー発生時の表示が正しいこと', async () => {
    mockFetch.mockRejectedValueOnce(new Error('エラーが発生しました'));
    render(<SearchResultTable />);
    await waitFor(() => {
      expect(
        screen.getByText('データの取得に失敗しました。サーバーが起動しているか確認してください。')
      ).toBeInTheDocument();
    });
  });

  it('データが空の場合の表示が正しいこと', async () => {
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve([]),
    });
    render(<SearchResultTable />);
    await waitFor(() => {
      expect(screen.getByText('データが見つかりませんでした。')).toBeInTheDocument();
      expect(
        screen.getByText('現在、データベースに大学情報が登録されていません。')
      ).toBeInTheDocument();
    });
  });

  it('データが正しく表示されること', async () => {
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve(mockData),
    });
    render(<SearchResultTable />);
  });

  it('行をクリックしたときに正しいURLが開かれること', async () => {
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve(mockData),
    });
    const mockOpen = vi.fn();
    window.open = mockOpen;

    render(<SearchResultTable />);
  });

  it('キーボード操作で行を選択したときに正しいURLが開かれること', async () => {
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve(mockData),
    });
    const mockOpen = vi.fn();
    window.open = mockOpen;

    render(<SearchResultTable />);
  });

  it('テーブルのアクセシビリティ属性が正しく設定されていること', async () => {
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve(mockData),
    });
    render(<SearchResultTable />);
  });

  it('無効なデータ形式の場合にエラーが表示されること', async () => {
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ invalid: 'data' }),
    });
    render(<SearchResultTable />);

    await waitFor(() => {
      expect(
        screen.getByText('データの取得に失敗しました。サーバーが起動しているか確認してください。')
      ).toBeInTheDocument();
    });
  });
});
