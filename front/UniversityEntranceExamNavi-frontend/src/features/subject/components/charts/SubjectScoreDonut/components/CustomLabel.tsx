import { FC } from 'react';
import { CustomLabelProps } from '@/features/subject/types';

export const CustomLabel: FC<CustomLabelProps> = (props) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent, name, displayName, isRightChart } =
    props;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * (innerRadius === 0 ? 0.75 : 0.5);
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.05) return null;

  const getLabelText = () => {
    if (isRightChart && innerRadius === 0) {
      if (name.includes('共通')) {
        const subject = name.replace(/共通|\(|\)/g, '').trim();
        return `(${subject})`;
      }
      if (name.includes('二次')) {
        const subject = name.replace(/二次|\(|\)/g, '').trim();
        return `(${subject})`;
      }
    }
    return displayName ?? name;
  };

  const labelText = getLabelText();

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
      <tspan x={x} dy="-0.5em" stroke="rgba(0,0,0,0.75)" strokeWidth="3" paintOrder="stroke">
        {labelText}
      </tspan>
      <tspan x={x} dy="1.2em" stroke="rgba(0,0,0,0.75)" strokeWidth="3" paintOrder="stroke">
        {`${(percent * 100).toFixed(1)}%`}
      </tspan>
      <tspan x={x} dy="-1.2em">
        {labelText}
      </tspan>
      <tspan x={x} dy="1.2em">
        {`${(percent * 100).toFixed(1)}%`}
      </tspan>
    </text>
  );
};
