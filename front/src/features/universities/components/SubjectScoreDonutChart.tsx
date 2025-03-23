import { FC } from "react";
import { UISubject } from "@/types/universities/subjects";
import { useSubjectChart } from "@/hooks/use-subject-chart";
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
  const { leftChart, rightChart } = useSubjectChart(subjectData);

  return (
    <div className="flex w-full gap-4">
      <div className={containerClassName} style={containerStyles}>
        <style>{pieChartStyles}</style>
        <DonutChart
          detailedData={leftChart.detailedData}
          outerData={leftChart.outerData}
        />
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
