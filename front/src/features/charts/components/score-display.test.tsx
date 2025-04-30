/**
 * 科目スコア表示コンポーネントのテスト
 *
 * @remarks
 * - コンポーネントのレンダリングを検証
 * - レイアウトとスタイリングを検証
 * - 子コンポーネントの表示を検証
 *
 * @module ScoreDisplayTest
 */

import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ScoreDisplay } from './score-display';
import { ChartScoreDisplayProps } from '@/features/charts/types/score-display';
import { UISubject } from '@/types/university-subject';

// ResizeObserverのモック
class ResizeObserverMock {
  observe() {
    return;
  }
  unobserve() {
    return;
  }
  disconnect() {
    return;
  }
}

describe('ScoreDisplay', () => {
  beforeEach(() => {
    // ResizeObserverをモック
    global.ResizeObserver = vi.fn().mockImplementation(() => new ResizeObserverMock());
  });

  const mockSubject: UISubject = {
    id: 1,
    name: 'テスト科目',
    score: 300,
    percentage: 100,
    displayOrder: 1,
    testTypeId: 1,
    university: { id: 1, name: 'テスト大学' },
    department: { id: 1, name: 'テスト学部' },
    major: { id: 1, name: 'テスト学科' },
    examInfo: {
      id: 1,
      enrollment: 100,
      academicYear: 2024,
      status: 'active',
    },
    admissionSchedule: {
      id: 1,
      name: 'テスト入試',
      displayOrder: 1,
    },
    subjects: {
      数学: {
        commonTest: 100,
        secondTest: 200,
      },
    },
    version: 1,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    createdBy: 'テストユーザー',
    updatedBy: 'テストユーザー',
  };

  const defaultProps: ChartScoreDisplayProps = {
    subject: mockSubject,
  };

  it('コンポーネントが正しくレンダリングされること', () => {
    render(<ScoreDisplay {...defaultProps} />);

    // コンテナの存在を確認
    expect(screen.getByTestId('score-display-container')).toBeInTheDocument();
    expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    expect(screen.getByTestId('subject-exam-comparison-chart')).toBeInTheDocument();
  });

  it('レスポンシブなレイアウトが適用されていること', () => {
    render(<ScoreDisplay {...defaultProps} />);

    const container = screen.getByTestId('score-display-container');
    expect(container).toHaveClass('w-full');

    const chartContainer = screen.getByTestId('chart-container');
    expect(chartContainer).toHaveClass('flex-1');
  });

  it('子コンポーネントが正しく表示されること', () => {
    render(<ScoreDisplay {...defaultProps} />);

    // SubjectExamComparisonChartの存在を確認
    const chart = screen.getByTestId('subject-exam-comparison-chart');
    expect(chart).toBeInTheDocument();
  });
});
