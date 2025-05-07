import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeAll, beforeEach, afterEach } from 'vitest';
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
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
      configurable: true,
      value: 800,
    });
    Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
      configurable: true,
      value: 600,
    });
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
      configurable: true,
      value: 800,
    });
    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
      configurable: true,
      value: 600,
    });
    Object.defineProperty(HTMLElement.prototype, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({
        width: 800,
        height: 600,
        top: 0,
        left: 0,
        right: 800,
        bottom: 600,
      }),
    });
  });

  afterEach(() => {
    // プロパティの設定をクリア
    delete (HTMLElement.prototype as any).clientWidth;
    delete (HTMLElement.prototype as any).clientHeight;
    delete (HTMLElement.prototype as any).offsetWidth;
    delete (HTMLElement.prototype as any).offsetHeight;
    delete (HTMLElement.prototype as any).getBoundingClientRect;
  });

  it('アクセシビリティ属性が正しく設定されていること', () => {
    render(
      <div style={{ width: '800px', height: '600px' }}>
        <UniversityLayout subject={mockSubject} />
      </div>
    );

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
    render(
      <div style={{ width: '800px', height: '600px' }}>
        <UniversityLayout subject={mockSubject} />
      </div>
    );

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
    render(
      <div style={{ width: '800px', height: '600px' }}>
        <UniversityLayout subject={mockSubject} />
      </div>
    );

    // BasicInfoコンポーネントの存在を確認
    expect(screen.getByRole('article', { name: '基本情報' })).toBeInTheDocument();

    // ScoreDisplayコンポーネントの存在を確認
    expect(screen.getByRole('article', { name: 'スコア表示' })).toBeInTheDocument();

    // SubjectScoreTableコンポーネントの存在を確認
    expect(screen.getByRole('region', { name: '科目別配点テーブル' })).toBeInTheDocument();
  });
});
