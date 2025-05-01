import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SubjectExamComparisonChart from './subject-exam-comparison-chart';
import { useSubjectChart } from '@/features/charts/hooks/use-subject-chart';
import { UISubject } from '@/types/university-subject';

// ResizeObserverのモック
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// useSubjectChartのモック
vi.mock('@/features/charts/hooks/use-subject-chart', () => ({
  useSubjectChart: vi.fn(),
}));

// Rechartsのモック設定
vi.mock('recharts', async () => {
  const OriginalModule = await vi.importActual('recharts');
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div style={{ width: 400, height: 400 }}>{children}</div>
    ),
  };
});

// テスト用のコンテナスタイル
const containerStyle = {
  width: '400px',
  height: '400px',
  minWidth: '400px',
  minHeight: '400px',
  position: 'relative' as const,
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'center',
  gap: '1rem',
};

describe('SubjectExamComparisonChart', () => {
  const mockSubjectData: UISubject = {
    id: 1,
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'test-user',
    updatedBy: 'test-user',
    name: '数学',
    score: 85,
    percentage: 85,
    displayOrder: 1,
    testTypeId: 1,
    university: { id: 1, name: 'テスト大学' },
    department: { id: 1, name: 'テスト学部' },
    major: { id: 1, name: 'テスト学科' },
    examInfo: { id: 1, enrollment: 100, academicYear: 2024, status: 'active' },
    admissionSchedule: { id: 1, name: '前期', displayOrder: 1 },
    subjects: {
      数学: { commonTest: 80, secondTest: 90 },
    },
  };

  const mockChartData = {
    subjectChart: {
      detailedData: [{ name: '数学', value: 85, percentage: 85 }],
      outerData: [{ name: '数学', value: 85, percentage: 85 }],
    },
    examChart: {
      detailedData: [
        { name: '共通テスト', value: 80, percentage: 80 },
        { name: '二次テスト', value: 90, percentage: 90 },
      ],
      outerData: [
        { name: '共通テスト', value: 80, percentage: 80 },
        { name: '二次テスト', value: 90, percentage: 90 },
      ],
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useSubjectChart as any).mockReturnValue(mockChartData);
  });

  it('科目データと試験データのチャートが正しく表示されること', () => {
    render(
      <div style={containerStyle}>
        <SubjectExamComparisonChart subjectData={mockSubjectData} />
      </div>
    );

    // チャートコンテナの確認
    expect(screen.getByTestId('subject-exam-comparison-chart')).toBeInTheDocument();
    expect(screen.getByTestId('subject-chart-container')).toBeInTheDocument();
    expect(screen.getByTestId('exam-chart-container')).toBeInTheDocument();

    // 科目データの確認
    const subjectContainer = screen.getByTestId('subject-chart-container');
    expect(subjectContainer).toBeInTheDocument();

    // 試験データの確認
    const examContainer = screen.getByTestId('exam-chart-container');
    expect(examContainer).toBeInTheDocument();
  });

  it('useSubjectChartが正しい引数で呼び出されること', () => {
    render(
      <div style={containerStyle}>
        <SubjectExamComparisonChart subjectData={mockSubjectData} />
      </div>
    );
    expect(useSubjectChart).toHaveBeenCalledWith(mockSubjectData);
  });

  it('チャートコンテナが正しいスタイルで表示されること', () => {
    const { container } = render(
      <div style={containerStyle}>
        <SubjectExamComparisonChart subjectData={mockSubjectData} />
      </div>
    );
    const chartContainers = container.querySelectorAll('.flex.w-full.gap-4');
    expect(chartContainers).toHaveLength(1);
  });
});
