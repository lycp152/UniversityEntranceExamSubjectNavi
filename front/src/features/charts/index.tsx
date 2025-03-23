import { FC } from "react";
import { DonutChart } from "@/components/charts/DonutChart";
import { useSubjectChart } from "@/hooks/use-subject-chart";
import {
  containerStyles,
  containerClassName,
  pieChartStyles,
} from "@/styles/chart-styles";
import type { UISubject } from "@/types/universities/subjects";

const mockSubject: UISubject = {
  id: 1,
  name: "英語L",
  score: 100,
  percentage: 100,
  displayOrder: 1,
  testTypeId: 1,
  university: {
    id: 1,
    name: "テスト大学",
  },
  department: {
    id: 1,
    name: "テスト学部",
  },
  major: {
    id: 1,
    name: "テスト学科",
  },
  examInfo: {
    id: 1,
    enrollment: 100,
    academicYear: 2024,
    status: "active",
  },
  admissionSchedule: {
    id: 1,
    name: "前期",
    displayOrder: 1,
  },
  subjects: {
    英語L: {
      commonTest: 100,
      secondTest: 75,
      maxCommonTest: 100,
      maxSecondTest: 100,
    },
    英語R: {
      commonTest: 100,
      secondTest: 75,
      maxCommonTest: 100,
      maxSecondTest: 100,
    },
    数学: {
      commonTest: 200,
      secondTest: 100,
      maxCommonTest: 200,
      maxSecondTest: 100,
    },
    国語: {
      commonTest: 200,
      secondTest: 100,
      maxCommonTest: 200,
      maxSecondTest: 100,
    },
    理科: {
      commonTest: 100,
      secondTest: 100,
      maxCommonTest: 100,
      maxSecondTest: 100,
    },
    地歴公: {
      commonTest: 100,
      secondTest: 50,
      maxCommonTest: 100,
      maxSecondTest: 100,
    },
  },
};

const SubjectScoreDonutChart: FC = () => {
  const { leftChart, rightChart } = useSubjectChart(mockSubject);

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
