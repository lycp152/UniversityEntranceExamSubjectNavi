import { FC } from 'react';
import { DonutChart } from '@/components/charts/DonutChart';
import { useSubjectChart } from '@/hooks/subject/use-subject-chart';
import { containerStyles, containerClassName, chartStyles } from '@/styles/chart-styles';
import type { UISubject } from '@/types/universities/university-subjects';

const mockSubject: UISubject = {
  id: 1,
  name: '英語L',
  score: 100,
  percentage: 100,
  displayOrder: 1,
  testTypeId: 1,
  university: {
    id: 1,
    name: 'テスト大学',
  },
  department: {
    id: 1,
    name: 'テスト学部',
  },
  major: {
    id: 1,
    name: 'テスト学科',
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
  subjects: {
    英語L: {
      commonTest: 100,
      secondTest: 75,
    },
    英語R: {
      commonTest: 100,
      secondTest: 75,
    },
    数学: {
      commonTest: 200,
      secondTest: 100,
    },
    国語: {
      commonTest: 200,
      secondTest: 100,
    },
    理科: {
      commonTest: 100,
      secondTest: 100,
    },
    地歴公: {
      commonTest: 100,
      secondTest: 50,
    },
  },
};

const SubjectScoreDonutChart: FC = () => {
  const { subjectChart, examChart } = useSubjectChart(mockSubject);

  return (
    <div className="flex w-full gap-4">
      <div className={containerClassName} style={containerStyles}>
        <style>{chartStyles}</style>
        <DonutChart detailedData={subjectChart.detailedData} outerData={subjectChart.outerData} />
      </div>
      <div className={containerClassName} style={containerStyles}>
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

export default SubjectScoreDonutChart;
