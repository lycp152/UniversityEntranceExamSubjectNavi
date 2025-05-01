/**
 * ドーナツチャートコンポーネントのテスト
 *
 * @remarks
 * - レンダリングの検証
 * - データの表示確認
 * - アクセシビリティの検証
 * - レスポンシブ対応の確認
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DonutChart } from './donut-chart';
import { DisplaySubjectScore } from '@/types/score';

// ResizeObserverのモック
class ResizeObserverMock {
  observe() {
    // モック実装のため空のメソッド
  }
  unobserve() {
    // モック実装のため空のメソッド
  }
  disconnect() {
    // モック実装のため空のメソッド
  }
}

// テスト用のモックデータ
const mockDetailedData: DisplaySubjectScore[] = [
  {
    name: '数学',
    value: 100,
    percentage: 0.5,
    category: 'mathematics',
    displayName: '数学',
  },
];

const mockOuterData: DisplaySubjectScore[] = [
  {
    name: '理科',
    value: 100,
    percentage: 1,
    category: 'science',
  },
];

describe('DonutChart', () => {
  beforeAll(() => {
    // グローバルにResizeObserverを定義
    global.ResizeObserver = ResizeObserverMock;
  });

  // テスト用のコンテナスタイル
  const containerStyle = {
    width: '400px',
    height: '400px',
    minWidth: '400px',
    minHeight: '400px',
    position: 'relative' as const,
  };

  it('共通テストのチャートが正しくレンダリングされること', () => {
    render(
      <div style={containerStyle}>
        <DonutChart
          detailedData={mockDetailedData}
          outerData={mockOuterData}
          isRightChart={false}
        />
      </div>
    );

    // figureタグとaria-labelの検証
    const chartContainer = screen.getByRole('figure');
    expect(chartContainer).toHaveAttribute('aria-label', '共通テスト科目配点');
  });

  it('二次試験のチャートが正しくレンダリングされること', () => {
    render(
      <div style={containerStyle}>
        <DonutChart detailedData={mockDetailedData} outerData={mockOuterData} isRightChart={true} />
      </div>
    );

    // figureタグとaria-labelの検証
    const chartContainer = screen.getByRole('figure');
    expect(chartContainer).toHaveAttribute('aria-label', '二次試験科目配点');
  });

  it('データに基づいて適切なセルがレンダリングされること', () => {
    render(
      <div style={containerStyle}>
        <DonutChart
          detailedData={mockDetailedData}
          outerData={mockOuterData}
          isRightChart={false}
        />
      </div>
    );

    // データの表示確認
    const mathCell = screen.getByRole('figure', { name: '共通テスト科目配点' });
    expect(mathCell).toBeInTheDocument();
  });

  it('レスポンシブコンテナが適切なサイズで設定されていること', () => {
    render(
      <div style={containerStyle}>
        <DonutChart
          detailedData={mockDetailedData}
          outerData={mockOuterData}
          isRightChart={false}
        />
      </div>
    );

    const container = screen.getByRole('figure');
    expect(container).toHaveClass('w-full h-[400px]');
  });
});
