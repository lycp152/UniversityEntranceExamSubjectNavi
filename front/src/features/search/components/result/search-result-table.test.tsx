import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SearchResultTable from './search-result-table';
import { transformUniversityData } from '@/features/search/utils/university-data-transformer';

// データ変換関数をモック
vi.mock('@/features/search/utils/university-data-transformer', () => ({
  transformUniversityData: vi.fn(),
}));

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
  const mockData = {
    data: [
      {
        university: { id: 1, name: 'テスト大学' },
        department: { id: 1, name: 'テスト学部' },
        major: { id: 1, name: 'テスト学科' },
        admissionSchedule: { id: 1, name: '前期' },
        examInfo: { academicYear: 2024, enrollment: 100 },
      },
    ],
  };

  // 変換後のデータ
  const transformedData = [
    {
      university: { id: 1, name: 'テスト大学' },
      department: { id: 1, name: 'テスト学部' },
      major: { id: 1, name: 'テスト学科' },
      admissionSchedule: { id: 1, name: '前期' },
      examInfo: { academicYear: 2024, enrollment: 100 },
    },
  ];

  // QueryClientのインスタンスを作成
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  beforeEach(() => {
    vi.clearAllMocks();
    // コンソールエラーをモック
    vi.spyOn(console, 'error').mockImplementation(() => {});
    // データ変換関数をモック
    (transformUniversityData as any).mockReturnValue(transformedData);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    queryClient.clear();
  });

  // コンポーネントをラップする関数
  const renderWithQueryClient = (component: React.ReactElement) => {
    return render(<QueryClientProvider client={queryClient}>{component}</QueryClientProvider>);
  };

  describe('ローディング状態のテスト', () => {
    it('データ取得中の表示が正しいこと', async () => {
      mockFetch.mockImplementationOnce(() => Promise.resolve());
      renderWithQueryClient(<SearchResultTable />);

      const spinner = screen.getByRole('status');
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveAttribute('aria-label', 'データを読み込み中');
    });
  });

  describe('エラーハンドリングのテスト', () => {
    it('エラー発生時の表示が正しいこと', async () => {
      const errorMessage = 'エラーが発生しました';
      mockFetch.mockRejectedValueOnce(new Error(errorMessage));

      renderWithQueryClient(<SearchResultTable />);

      await waitFor(
        () => {
          const errorElement = screen.getByText(
            'データの取得に失敗しました。サーバーが起動しているか確認してください。'
          );
          expect(errorElement).toBeInTheDocument();
        },
        { timeout: 5000 }
      );
    });

    it('ネットワークエラーが発生した場合に適切なエラーメッセージが表示されること', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network Error'));

      renderWithQueryClient(<SearchResultTable />);

      await waitFor(
        () => {
          const errorElement = screen.getByText(
            'データの取得に失敗しました。サーバーが起動しているか確認してください。'
          );
          expect(errorElement).toBeInTheDocument();
        },
        { timeout: 5000 }
      );
    });
  });

  describe('データ表示のテスト', () => {
    it('データが空の場合の表示が正しいこと', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ data: [] }),
      });
      (transformUniversityData as any).mockReturnValue([]);

      renderWithQueryClient(<SearchResultTable />);

      await waitFor(() => {
        const emptyState = screen.getByText('データが見つかりませんでした。');
        expect(emptyState).toBeInTheDocument();
      });
    });

    it('データが正しく表示されること', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockData),
      });

      renderWithQueryClient(<SearchResultTable />);

      await waitFor(() => {
        expect(screen.getByText('テスト大学')).toBeInTheDocument();
        expect(screen.getByText('テスト学部')).toBeInTheDocument();
        expect(screen.getByText('テスト学科')).toBeInTheDocument();
      });
    });
  });

  describe('インタラクションのテスト', () => {
    it('行をクリックしたときに正しいURLが開かれること', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockData),
      });
      const mockOpen = vi.fn();
      window.open = mockOpen;

      renderWithQueryClient(<SearchResultTable />);

      await waitFor(() => {
        const row = screen.getByText('テスト大学').closest('tr');
        expect(row).toBeInTheDocument();
      });

      const row = screen.getByText('テスト大学').closest('tr');
      if (row) {
        fireEvent.click(row);
      }

      expect(mockOpen).toHaveBeenCalledWith('/universities/2024/1/1/1/1', '_blank');
    });

    it('キーボード操作で行を選択したときに正しいURLが開かれること', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockData),
      });
      const mockOpen = vi.fn();
      window.open = mockOpen;

      renderWithQueryClient(<SearchResultTable />);

      await waitFor(() => {
        const row = screen.getByText('テスト大学').closest('tr');
        expect(row).toBeInTheDocument();
      });

      const row = screen.getByText('テスト大学').closest('tr');
      if (row) {
        fireEvent.keyDown(row, { key: 'Enter', code: 'Enter' });
      }

      expect(mockOpen).toHaveBeenCalledWith('/universities/2024/1/1/1/1', '_blank');
    });
  });

  describe('アクセシビリティのテスト', () => {
    it('テーブルのアクセシビリティ属性が正しく設定されていること', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockData),
      });

      renderWithQueryClient(<SearchResultTable />);

      await waitFor(() => {
        const table = screen.getByRole('table');
        expect(table).toHaveAttribute('aria-label', '大学入試科目の配点比率');

        const headers = screen.getAllByRole('columnheader');
        expect(headers).toHaveLength(5);
        expect(headers[0]).toHaveTextContent('大学名');
        expect(headers[1]).toHaveTextContent('学部');
        expect(headers[2]).toHaveTextContent('学科');
        expect(headers[3]).toHaveTextContent('日程');
        expect(headers[4]).toHaveTextContent('募集人員');
      });
    });

    it('行のアクセシビリティ属性が正しく設定されていること', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockData),
      });

      renderWithQueryClient(<SearchResultTable />);

      await waitFor(() => {
        const row = screen.getByText('テスト大学').closest('tr');
        expect(row).toHaveAttribute('tabindex', '0');
        expect(row).toHaveAttribute(
          'aria-label',
          'テスト大学 テスト学部 テスト学科 前期 募集人員100名'
        );
      });
    });
  });

  describe('データ検証のテスト', () => {
    it('無効なデータ形式の場合にエラーが表示されること', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ invalid: 'data' }),
      });

      renderWithQueryClient(<SearchResultTable />);

      await waitFor(
        () => {
          const errorElement = screen.getByText(
            'データの取得に失敗しました。サーバーが起動しているか確認してください。'
          );
          expect(errorElement).toBeInTheDocument();
        },
        { timeout: 5000 }
      );
    });
  });
});
