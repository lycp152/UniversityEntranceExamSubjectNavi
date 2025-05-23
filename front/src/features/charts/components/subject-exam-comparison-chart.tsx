/**
 * 科目と試験の比較チャートコンポーネント
 *
 * @remarks
 * - 科目データと試験データを並べて表示
 * - ドーナツチャートを使用して視覚化
 * - パターンとラベルを適用
 * - ツールチップによる詳細情報の表示
 */
import { FC } from 'react';
import { useSubjectChart } from '@/features/charts/hooks/use-subject-chart';
import {
  containerStyles,
  containerClassName,
  chartStyles,
} from '@/features/charts/constants/chart-styles';
import { DonutChart } from './donut-chart';
import { SubjectExamComparisonChartProps } from '../types/chart';

/**
 * 科目と試験の比較チャートコンポーネント
 *
 * @param props - コンポーネントのプロパティ
 * @param props.subjectData - 表示する科目データ
 *
 * @returns 科目と試験の比較チャートのReact要素
 */
const SubjectExamComparisonChart: FC<SubjectExamComparisonChartProps> = ({ subjectData }) => {
  const { subjectChart, examChart } = useSubjectChart(subjectData);

  return (
    <div className="flex w-full gap-4" data-testid="subject-exam-comparison-chart">
      <div
        className={containerClassName}
        style={{ ...containerStyles, minWidth: '400px', minHeight: '400px' }}
        data-testid="subject-chart-container"
      >
        <style>{chartStyles}</style>
        <DonutChart detailedData={subjectChart.detailedData} outerData={subjectChart.outerData} />
      </div>
      <div
        className={containerClassName}
        style={{ ...containerStyles, minWidth: '400px', minHeight: '400px' }}
        data-testid="exam-chart-container"
      >
        <style>{chartStyles}</style>
        <DonutChart
          detailedData={examChart.detailedData}
          outerData={examChart.outerData}
          isRightChart={true}
        />
      </div>
    </div>
  );
};

export default SubjectExamComparisonChart;
