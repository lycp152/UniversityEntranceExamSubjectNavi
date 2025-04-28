import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import UniversityLayout from './layout';
import { UISubject } from '@/types/university-subject';

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

// モックデータ
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

/**
 * レイアウトコンポーネントのテスト
 * アクセシビリティ、レイアウト構造、コンポーネントの統合を検証
 */
describe('UniversityLayout', () => {
  beforeEach(() => {
    // チャートコンポーネントのサイズを設定
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', { value: 800 });
    Object.defineProperty(HTMLElement.prototype, 'clientHeight', { value: 600 });
  });

  it('アクセシビリティ属性が正しく設定されていること', () => {
    render(<UniversityLayout subject={mockSubject} />);

    // メインコンテンツのaria-labelを確認
    const main = screen.getByRole('main');
    expect(main).toHaveAttribute('aria-label', '東京大学 理学部 数学科の科目情報');

    // セクションのaria-labelを確認
    const sections = screen.getAllByRole('region');
    expect(sections[0]).toHaveAttribute('aria-label', '科目情報とスコア表示');

    // 科目別配点テーブルのセクションを特定の方法で取得
    const scoreTableSection = screen.getByRole('region', { name: '科目別配点テーブル' });
    expect(scoreTableSection).toBeInTheDocument();

    // 記事のaria-labelを確認
    const articles = screen.getAllByRole('article');
    expect(articles[0]).toHaveAttribute('aria-label', '基本情報');
    expect(articles[1]).toHaveAttribute('aria-label', 'スコア表示');
  });

  it('レイアウト構造が正しく配置されていること', () => {
    render(<UniversityLayout subject={mockSubject} />);

    // メインコンテンツの構造を確認
    const main = screen.getByRole('main');
    expect(main).toHaveClass('container', 'mx-auto', 'px-4', 'py-8');

    // セクションの構造を確認
    const sections = screen.getAllByRole('region');
    expect(sections[0]).toHaveClass('flex', 'flex-col', 'md:flex-row', 'gap-4');

    // 科目別配点テーブルのセクションを特定の方法で取得
    const scoreTableSection = screen.getByRole('region', { name: '科目別配点テーブル' });
    expect(scoreTableSection).toHaveClass('mt-8');

    // 記事の構造を確認
    const articles = screen.getAllByRole('article');
    expect(articles[0]).toHaveClass('w-full', 'md:w-1/4');
    expect(articles[1]).toHaveClass('flex-1', 'flex', 'bg-transparent');
  });

  it('子コンポーネントが正しくレンダリングされていること', () => {
    render(<UniversityLayout subject={mockSubject} />);

    // BasicInfoコンポーネントの存在を確認
    expect(screen.getByRole('article', { name: '基本情報' })).toBeInTheDocument();

    // ScoreDisplayコンポーネントの存在を確認
    expect(screen.getByRole('article', { name: 'スコア表示' })).toBeInTheDocument();

    // SubjectScoreTableコンポーネントの存在を確認
    expect(screen.getByRole('region', { name: '科目別配点テーブル' })).toBeInTheDocument();
  });
});
