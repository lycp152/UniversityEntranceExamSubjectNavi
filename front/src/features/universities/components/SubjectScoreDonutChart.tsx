import { FC } from "react";
import { UISubject } from "@/types/universities/subjects";
import { useSubjectChart } from "@/hooks/subject/use-subject-chart";
import {
  containerStyles,
  containerClassName,
  pieChartStyles,
} from "@/styles/chart-styles";
import { DonutChart } from "@/components/charts/DonutChart";

interface SubjectScoreDonutChartProps {
  subjectData: UISubject;
}

const SubjectScoreDonutChart: FC<SubjectScoreDonutChartProps> = ({
  subjectData,
}) => {
  const { subjectChart, examChart } = useSubjectChart(subjectData);

  return (
    <div className="flex w-full gap-4">
      <div className={containerClassName} style={containerStyles}>
        <style>{pieChartStyles}</style>
        <DonutChart
          detailedData={subjectChart.detailedData}
          outerData={subjectChart.outerData}
        />
      </div>
      <div className={containerClassName} style={containerStyles}>
        <style>{pieChartStyles}</style>
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
