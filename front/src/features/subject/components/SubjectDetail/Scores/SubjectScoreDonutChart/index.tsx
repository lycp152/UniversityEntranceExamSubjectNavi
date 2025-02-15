import { FC } from 'react';
import { subjects } from '@/features/data/SubjectData';
import { useSubjectChart } from '@/features/subject/hooks/useSubjectChart';
import { containerStyles, containerClassName, pieChartStyles } from './styles';
import { DonutChart } from './components/DonutChart';

const SubjectScoreDonutChart: FC = () => {
  const subjectData = subjects[0];
  const { leftChart, rightChart } = useSubjectChart(subjectData);

  return (
    <div className="flex w-full gap-4">
      <div className={containerClassName} style={containerStyles}>
        <style>{pieChartStyles}</style>
        <DonutChart detailedData={leftChart.detailedData} outerData={leftChart.outerData} />
      </div>
      <div className={containerClassName} style={containerStyles}>
        <style>{pieChartStyles}</style>
        <DonutChart
          detailedData={rightChart.detailedData}
          outerData={rightChart.outerData}
          isRightChart={true}
        />
      </div>
    </div>
  );
};

export default SubjectScoreDonutChart;
