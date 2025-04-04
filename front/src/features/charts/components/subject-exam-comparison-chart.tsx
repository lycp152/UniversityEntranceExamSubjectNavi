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
import { useSubjectChart } from '@/hooks/subject/use-subject-chart';
import { containerStyles, containerClassName, chartStyles } from '@/styles/chart-styles';
import { BaseChart } from './base-chart';
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
    <div className="flex w-full gap-4">
      <div className={containerClassName} style={containerStyles}>
        <style>{chartStyles}</style>
        <BaseChart detailedData={subjectChart.detailedData} outerData={subjectChart.outerData} />
      </div>
      <div className={containerClassName} style={containerStyles}>
        <style>{chartStyles}</style>
        <BaseChart
          detailedData={examChart.detailedData}
          outerData={examChart.outerData}
          isRightChart={true}
        />
      </div>
    </div>
  );
};

export default SubjectExamComparisonChart;
