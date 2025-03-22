import { FC } from "react";
import { Subject } from "@/types/subjects/subject";
import { useSubjectChart } from "@/features/charts/hooks/useSubjectChart";
import { containerStyles, containerClassName, pieChartStyles } from "./styles";
import { DonutChart } from "./components/DonutChart";

interface SubjectScoreDonutChartProps {
  subjectData: Subject;
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
