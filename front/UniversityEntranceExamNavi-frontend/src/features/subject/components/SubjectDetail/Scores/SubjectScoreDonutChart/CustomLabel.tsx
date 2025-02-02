import { FC } from "react";

interface Props {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
  name: string;
  displayName?: string;
}

const CustomLabel: FC<Props> = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  name,
  displayName,
}) => {
  const RADIAN = Math.PI / 180;
  const radius =
    innerRadius +
    (outerRadius - innerRadius) * (innerRadius === 0 ? 0.75 : 0.5);
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.05) return null;

  return (
    <text
      x={x}
      y={y}
      fill="white"
      fontWeight="600"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={12}
    >
      <tspan
        x={x}
        dy="-0.5em"
        stroke="rgba(0,0,0,0.75)"
        strokeWidth="3"
        paintOrder="stroke"
      >
        {displayName ?? name}
      </tspan>
      <tspan
        x={x}
        dy="1.2em"
        stroke="rgba(0,0,0,0.75)"
        strokeWidth="3"
        paintOrder="stroke"
      >
        {`${(percent * 100).toFixed(1)}%`}
      </tspan>
      <tspan x={x} dy="-1.2em">
        {displayName ?? name}
      </tspan>
      <tspan x={x} dy="1.2em">
        {`${(percent * 100).toFixed(1)}%`}
      </tspan>
    </text>
  );
};

export default CustomLabel;
