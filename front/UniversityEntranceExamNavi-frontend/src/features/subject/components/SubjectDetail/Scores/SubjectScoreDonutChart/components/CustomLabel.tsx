import { FC } from 'react';
import { CustomLabelProps } from '@/features/subject/types';

// ラベルテキストを加工する関数
const formatLabelText = (name: string, isRight: boolean) => {
  if (isRight) {
    // 右側グラフの場合：(英語R) → (英語)\nR
    const match = name.match(/\((.*?)([LR])\)/);
    if (match) {
      const [_, subject, lr] = match;
      return `(${subject})\n${lr}`; // 括弧を含めた形で改行
    }
  }
  // 左側グラフの場合：英語R(共通) → 英語R\n(共通)
  if (name.match(/[LR]\(/)) {
    return name.replace(/([LR])(\()/, '$1\n$2');
  }
  return name;
};

const CustomLabel: FC<CustomLabelProps> = (props) => {
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

  // テキストが改行を含むかチェックを修正
  const hasLineBreak = isRightChart
    ? labelText.match(/\((.*?)([LR])\)/) // 右側グラフの場合
    : labelText.match(/[LR]\(/); // 左側グラフの場合

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
        {formatLabelText(labelText, isRightChart ?? false).split('\n')[0]}
      </tspan>
      {hasLineBreak ? (
        <>
          <tspan x={x} dy="1.2em" stroke="rgba(0,0,0,0.75)" strokeWidth="3" paintOrder="stroke">
            {formatLabelText(labelText, isRightChart ?? false).split('\n')[1]}
          </tspan>
          <tspan x={x} dy="1.2em" stroke="rgba(0,0,0,0.75)" strokeWidth="3" paintOrder="stroke">
            {`${(percent * 100).toFixed(1)}%`}
          </tspan>
        </>
      ) : (
        <tspan x={x} dy="1.2em" stroke="rgba(0,0,0,0.75)" strokeWidth="3" paintOrder="stroke">
          {`${(percent * 100).toFixed(1)}%`}
        </tspan>
      )}
      <tspan x={x} dy={hasLineBreak ? '-2.4em' : '-1.2em'}>
        {formatLabelText(labelText, isRightChart ?? false).split('\n')[0]}
      </tspan>
      {hasLineBreak ? (
        <>
          <tspan x={x} dy="1.2em">
            {formatLabelText(labelText, isRightChart ?? false).split('\n')[1]}
          </tspan>
          <tspan x={x} dy="1.2em">
            {`${(percent * 100).toFixed(1)}%`}
          </tspan>
        </>
      ) : (
        <tspan x={x} dy="1.2em">
          {`${(percent * 100).toFixed(1)}%`}
        </tspan>
      )}
    </text>
  );
};

export default CustomLabel;
