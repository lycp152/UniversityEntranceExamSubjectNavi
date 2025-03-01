import { FC } from "react";
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { SubjectScore } from "@/types/subject/score";
import CustomLabel from "./CustomLabel";
import Patterns from "@/components/features/charts/subject/donut/patterns";
import {
  ChartTooltip,
  TooltipPayload,
} from "@/components/features/charts/subject/donut/components/ChartTooltip";
import { getSubjectBaseCategory } from "@/utils/subject/operations/subjectOperations";
import { CHART_CONFIG } from "@/lib/constants/subject/chart";

type ChartProps = {
  detailedData: SubjectScore[];
  outerData: SubjectScore[];
  isRightChart?: boolean;
};

// パターン選択戦略
const patternStrategies = {
  right: (entry: SubjectScore) => `url(#pattern-${entry.category})`,
  left: (entry: SubjectScore) =>
    `url(#pattern-${getSubjectBaseCategory(entry.name)})`,
};

const getChartFillColor = (entry: SubjectScore, isRightChart: boolean) => {
  const strategyKey = isRightChart ? "right" : "left";
  const strategy = patternStrategies[strategyKey];
  return strategy(entry);
};

// 外側と内側で同じ戦略を使用
const getOuterChartFillColor = getChartFillColor;
const getInnerChartFillColor = getChartFillColor;

export const DonutChart: FC<ChartProps> = ({
  detailedData,
  outerData,
  isRightChart,
}) => (
  <ResponsiveContainer width="100%" height="100%">
    <RechartsPieChart>
      <defs>
        <Patterns />
      </defs>

      <Pie
        data={detailedData}
        cx={CHART_CONFIG.COMMON.CENTER_X}
        cy={CHART_CONFIG.COMMON.CENTER_Y}
        innerRadius={CHART_CONFIG.INNER_CHART.INNER_RADIUS}
        outerRadius={CHART_CONFIG.INNER_CHART.OUTER_RADIUS}
        fill={CHART_CONFIG.INNER_CHART.DEFAULT_FILL}
        dataKey="value"
        labelLine={false}
        label={(props) => CustomLabel({ ...props, isRightChart })}
        startAngle={CHART_CONFIG.COMMON.START_ANGLE}
        endAngle={CHART_CONFIG.COMMON.END_ANGLE}
      >
        {detailedData.map((entry) => (
          <Cell
            key={`cell-${entry.name}`}
            fill={getInnerChartFillColor(entry, isRightChart ?? false)}
          />
        ))}
      </Pie>

      <Pie
        data={outerData}
        cx={CHART_CONFIG.COMMON.CENTER_X}
        cy={CHART_CONFIG.COMMON.CENTER_Y}
        innerRadius={CHART_CONFIG.OUTER_CHART.INNER_RADIUS}
        outerRadius={CHART_CONFIG.OUTER_CHART.OUTER_RADIUS}
        fill={CHART_CONFIG.OUTER_CHART.DEFAULT_FILL}
        dataKey="value"
        labelLine={false}
        label={(props) => CustomLabel({ ...props, isRightChart })}
        startAngle={CHART_CONFIG.COMMON.START_ANGLE}
        endAngle={CHART_CONFIG.COMMON.END_ANGLE}
      >
        {outerData.map((entry) => (
          <Cell
            key={`cell-${entry.name}`}
            fill={getOuterChartFillColor(entry, isRightChart ?? false)}
          />
        ))}
      </Pie>
      <Tooltip
        formatter={(value: number, name: string, entry: TooltipPayload) =>
          ChartTooltip(value, name, entry)
        }
      />
    </RechartsPieChart>
  </ResponsiveContainer>
);
