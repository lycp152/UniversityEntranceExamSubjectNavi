import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import UniversityPage from './page';
import { UISubject } from '@/types/university-subject';
import { useUniversityData } from '@/features/universities/hooks/use-university-data';
import { UniversityPageParams } from '@/features/universities/types/params';

/**
 * 大学詳細ページコンポーネントのテスト
 *
 * このテストスイートでは、大学の詳細情報を表示するページの
 * レンダリングと表示内容を検証します。
 *
 * @module page.test
 */

// ResizeObserverのモックを設定
beforeAll(() => {
  global.ResizeObserver = class ResizeObserver {
    observe() {
      /* テスト環境では実装不要 */
    }
    unobserve() {
      /* テスト環境では実装不要 */
    }
    disconnect() {
      /* テスト環境では実装不要 */
    }
  };
});

// notFoundのモックを設定
vi.mock('next/navigation', () => ({
  notFound: () => {
    throw new Error('NEXT_HTTP_ERROR_FALLBACK;404');
  },
}));

// モックデータ
const mockParams: UniversityPageParams = {
  universityId: '1',
  departmentId: '1',
  majorId: '1',
  academicYear: '2024',
  schedule: '前期',
};

// モックの科目データ
const mockSubject: UISubject = {
  id: 1,
  version: 1,
  name: '数学',
  score: 100,
  percentage: 50,
  displayOrder: 1,
  testTypeId: 1,
  university: {
    id: 1,
    name: '東京大学',
  },
  department: {
    id: 1,
    name: '理学部',
  },
  major: {
    id: 1,
    name: '数学科',
  },
  examInfo: {
    id: 1,
    enrollment: 100,
    academicYear: 2024,
    status: 'active',
  },
  admissionSchedule: {
    id: 1,
    name: '前期',
    displayOrder: 1,
  },
  subjects: {},
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  createdBy: 'system',
  updatedBy: 'system',
};

// useUniversityDataのモック
vi.mock('@/features/universities/hooks/use-university-data', () => ({
  useUniversityData: vi.fn(),
}));

/**
 * 大学詳細ページのテスト
 * ローディング状態、エラーハンドリング、データ表示を検証
 */
describe('UniversityPage', () => {
  beforeEach(() => {
    // チャートコンポーネントのサイズを設定
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', { value: 800 });
    Object.defineProperty(HTMLElement.prototype, 'clientHeight', { value: 600 });
  });

  it('ローディング中はスピナーが表示されること', async () => {
    // useUniversityDataのモックを設定
    vi.mocked(useUniversityData).mockReturnValue({
      selectedSubject: null,
      loading: true,
      error: null,
    });

    await act(async () => {
      render(<UniversityPage params={Promise.resolve(mockParams)} />);
    });

    // スピナーが表示されていることを確認
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('エラー発生時はエラーメッセージが表示されること', async () => {
    // useUniversityDataのモックを設定
    vi.mocked(useUniversityData).mockReturnValue({
      selectedSubject: null,
      loading: false,
      error: 'データの取得に失敗しました',
    });

    await act(async () => {
      render(<UniversityPage params={Promise.resolve(mockParams)} />);
    });

    // エラーメッセージが表示されていることを確認
    expect(screen.getByText('データの取得に失敗しました')).toBeInTheDocument();
  });

  it('科目が見つからない場合は404ページが表示されること', async () => {
    // useUniversityDataのモックを設定
    vi.mocked(useUniversityData).mockReturnValue({
      selectedSubject: null,
      loading: false,
      error: null,
    });

    await expect(async () => {
      await act(async () => {
        render(<UniversityPage params={Promise.resolve(mockParams)} />);
      });
    }).rejects.toThrow('NEXT_HTTP_ERROR_FALLBACK;404');
  });

  it('データ取得成功時は大学の詳細情報が表示されること', async () => {
    // useUniversityDataのモックを設定
    vi.mocked(useUniversityData).mockReturnValue({
      selectedSubject: mockSubject,
      loading: false,
      error: null,
    });

    await act(async () => {
      render(<UniversityPage params={Promise.resolve(mockParams)} />);
    });

    // 大学名が表示されていることを確認
    expect(screen.getByText('東京大学')).toBeInTheDocument();
    // 学部名が表示されていることを確認
    expect(screen.getByText('理学部')).toBeInTheDocument();
    // 学科名が表示されていることを確認
    expect(screen.getByText('数学科')).toBeInTheDocument();
  });
});
