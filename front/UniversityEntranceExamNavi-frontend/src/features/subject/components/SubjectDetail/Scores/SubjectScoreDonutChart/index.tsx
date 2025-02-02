import { FC } from 'react';
import { subjects } from '@/features/data/SubjectData';
import { useChartData } from './hooks/useChartData';
import ChartContainer from './components/ChartContainer';
import Chart from './components/Chart';

const PieChart: FC = () => {
  const chartData = useChartData(subjects[0]);

  return (
    <ChartContainer>
      <Chart data={chartData} />
    </ChartContainer>
  );
};

export default PieChart;
