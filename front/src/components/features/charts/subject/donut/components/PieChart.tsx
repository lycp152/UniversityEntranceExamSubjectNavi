import { FC } from "react";
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { subjects } from "@/lib/data/SubjectData";
import CustomLabel from "./CustomLabel";
import { useChartData } from "@/components/features/charts/subject/donut/hooks/useChartData";
import { COLORS } from "@/lib/constants/subject";
import { pieChartStyles } from "../styles";
import { Patterns } from "";

const SubjectDetailPieChart: FC = () => {
  const subjectData = subjects[0];
  const { detailedData, outerData } = useChartData(subjectData);

  return (
    <div
      className="w-full h-[500px] bg-white p-4"
      style={{ WebkitTapHighlightColor: "transparent" }}
    >
      <style>{pieChartStyles}</style>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <defs>
            <Patterns />
          </defs>

          <Pie
            data={detailedData}
            cx="50%"
            cy="50%"
            innerRadius={0}
            outerRadius={150}
            fill="#8884d8"
            dataKey="value"
            labelLine={false}
            label={CustomLabel}
            startAngle={90}
            endAngle={-270}
          >
            {detailedData.map((entry) => (
              <Cell
                key={`cell-${entry.name}`}
                fill={
                  entry.name.includes("共通")
                    ? COLORS[entry.category as keyof typeof COLORS]
                    : `url(#pattern-${entry.category})`
                }
              />
            ))}
          </Pie>

          <Pie
            data={outerData}
            cx="50%"
            cy="50%"
            innerRadius={170}
            outerRadius={220}
            fill="#82ca9d"
            dataKey="value"
            labelLine={false}
            label={CustomLabel}
            startAngle={90}
            endAngle={-270}
          >
            {outerData.map((entry) => (
              <Cell
                key={`cell-${entry.name}`}
                fill={`url(#pattern-${entry.name})`}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number, name: string, entry: any) => [
              `${value}点${
                entry?.payload?.percentage
                  ? ` (${entry.payload.percentage.toFixed(1)}%)`
                  : ""
              }`,
              name,
            ]}
          />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SubjectDetailPieChart;
