import { FC } from 'react';
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartProps, SubjectScore } from '@/features/subject/types';
import CustomLabel from './CustomLabel';
import Patterns from '../Patterns';
import { ChartTooltip, TooltipPayload } from './ChartTooltip';
import {
  isCommonSubject,
  isSecondarySubject,
  getSubjectBaseCategory,
} from '@/features/subject/utils/chartUtils';
import { CHART_CONFIG } from '@/features/subject/constants/chart';
import { SUBJECT_COLORS, TEST_TYPE_COLORS } from '../constants';

// 外側の円グラフ用
const getOuterChartFillColor = (entry: SubjectScore, isRightChart: boolean) => {
  if (isRightChart) {
    // 右側は共通/二次のパターンを使用
    return `url(#pattern-${entry.category})`;
  }
  // 左側は科目別のパターンを使用
  return `url(#pattern-${getSubjectBaseCategory(entry.name)})`;
};

// 内側の円グラフ用
const getInnerChartFillColor = (entry: SubjectScore, isRightChart: boolean) => {
  return isRightChart
    ? `url(#pattern-${entry.category})`
    : `url(#pattern-${getSubjectBaseCategory(entry.name)})`;
};

export const DonutChart: FC<ChartProps> = ({ detailedData, outerData, isRightChart }) => (
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
