import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
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

  beforeEach(() => {
    vi.clearAllMocks();
    // コンソールエラーをモック
    vi.spyOn(console, 'error').mockImplementation(() => {});
    // データ変換関数をモック
    (transformUniversityData as any).mockReturnValue(transformedData);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('ローディング状態のテスト', () => {
    it('データ取得中の表示が正しいこと', async () => {
      mockFetch.mockImplementationOnce(() => Promise.resolve());
      render(<SearchResultTable />);

      const spinner = screen.getByRole('status');
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveAttribute('aria-label', 'データを読み込み中');
    });
  });

  describe('エラーハンドリングのテスト', () => {
    it('エラー発生時の表示が正しいこと', async () => {
      const errorMessage = 'エラーが発生しました';
      mockFetch.mockRejectedValueOnce(new Error(errorMessage));

      await act(async () => {
        render(<SearchResultTable />);
      });

      await waitFor(() => {
        const errorElement = screen.getByRole('alert');
        expect(errorElement).toBeInTheDocument();
        expect(errorElement).toHaveTextContent(
          'データの取得に失敗しました。サーバーが起動しているか確認してください。'
        );
      });
    });

    it('ネットワークエラーが発生した場合に適切なエラーメッセージが表示されること', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network Error'));

      await act(async () => {
        render(<SearchResultTable />);
      });

      await waitFor(() => {
        const errorElement = screen.getByRole('alert');
        expect(errorElement).toBeInTheDocument();
        expect(errorElement).toHaveTextContent(
          'データの取得に失敗しました。サーバーが起動しているか確認してください。'
        );
      });
    });
  });

  describe('データ表示のテスト', () => {
    it('データが空の場合の表示が正しいこと', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ data: [] }),
      });
      (transformUniversityData as any).mockReturnValue([]);

      await act(async () => {
        render(<SearchResultTable />);
      });

      await waitFor(() => {
        const emptyState = screen.getByRole('status');
        expect(emptyState).toBeInTheDocument();
        expect(emptyState).toHaveTextContent('データが見つかりませんでした。');
        expect(emptyState).toHaveTextContent('現在、データベースに大学情報が登録されていません。');
      });
    });

    it('データが正しく表示されること', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockData),
      });

      await act(async () => {
        render(<SearchResultTable />);
      });

      await waitFor(() => {
        const table = screen.getByRole('table');
        expect(table).toBeInTheDocument();
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

      await act(async () => {
        render(<SearchResultTable />);
      });

      await waitFor(() => {
        const row = screen.getByText('テスト大学').closest('tr');
        expect(row).toBeInTheDocument();
      });

      const row = screen.getByText('テスト大学').closest('tr');
      if (row) {
        await act(async () => {
          fireEvent.click(row);
        });
      }

      await waitFor(() => {
        expect(mockOpen).toHaveBeenCalledWith('/universities/2024/1/1/1/1', '_blank');
      });
    });

    it('キーボード操作で行を選択したときに正しいURLが開かれること', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockData),
      });
      const mockOpen = vi.fn();
      window.open = mockOpen;

      await act(async () => {
        render(<SearchResultTable />);
      });

      await waitFor(() => {
        const row = screen.getByText('テスト大学').closest('tr');
        expect(row).toBeInTheDocument();
      });

      const row = screen.getByText('テスト大学').closest('tr');
      if (row) {
        await act(async () => {
          fireEvent.keyDown(row, { key: 'Enter', code: 'Enter' });
        });
      }

      await waitFor(() => {
        expect(mockOpen).toHaveBeenCalledWith('/universities/2024/1/1/1/1', '_blank');
      });
    });
  });

  describe('アクセシビリティのテスト', () => {
    it('テーブルのアクセシビリティ属性が正しく設定されていること', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockData),
      });

      await act(async () => {
        render(<SearchResultTable />);
      });

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

      await act(async () => {
        render(<SearchResultTable />);
      });

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

      await act(async () => {
        render(<SearchResultTable />);
      });

      await waitFor(() => {
        const errorElement = screen.getByRole('alert');
        expect(errorElement).toBeInTheDocument();
        expect(errorElement).toHaveTextContent(
          'データの取得に失敗しました。サーバーが起動しているか確認してください。'
        );
      });
    });
  });
});
