import { FC } from "react";
import { DonutChart } from "./components/DonutChart";
import { useSubjectChart } from "@/features/charts/hooks/useSubjectChart";
import { containerStyles, containerClassName, pieChartStyles } from "./styles";

const mockSubject = {
  id: 1,
  universityId: 1,
  departmentId: 1,
  majorId: 1,
  admissionScheduleId: 1,
  academicYear: 2024,
  subjectId: 1,
  universityName: "テスト大学",
  department: "テスト学部",
  major: "テスト学科",
  admissionSchedule: "前期",
  enrollment: 100,
  rank: 1,
  subjects: {
    英語L: { commonTest: 100, secondTest: 75 },
    英語R: { commonTest: 100, secondTest: 75 },
    数学: { commonTest: 200, secondTest: 100 },
    国語: { commonTest: 200, secondTest: 100 },
    理科: { commonTest: 100, secondTest: 100 },
    地歴公: { commonTest: 100, secondTest: 50 },
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
