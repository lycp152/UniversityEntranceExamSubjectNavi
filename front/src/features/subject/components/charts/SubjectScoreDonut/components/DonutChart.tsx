import { FC } from 'react';
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartProps, SubjectScore } from '@/features/subject/types';
import { COLORS } from '@/features/subject/constants';
import { CHART_CONFIG } from '@/features/subject/constants/chart';
import { ChartTooltip, TooltipPayload } from './ChartTooltip';
import { CustomLabel } from './CustomLabel';
import Patterns from '../Patterns';
import {
  isCommonSubject,
  isSecondarySubject,
  getSubjectBaseCategory,
} from '@/features/subject/utils/subjectOperations';

const getFillColor = (entry: SubjectScore) => {
  if (isCommonSubject(entry.name) || isSecondarySubject(entry.name)) {
    return COLORS[entry.category as keyof typeof COLORS];
  }
  return `url(#pattern-${getSubjectBaseCategory(entry.name)})`;
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
          <Cell key={`cell-${entry.name}`} fill={getFillColor(entry)} />
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
          <Cell key={`cell-${entry.name}`} fill={getFillColor(entry)} />
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
