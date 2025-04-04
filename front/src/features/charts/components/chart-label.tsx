/**
 * チャートのラベル表示コンポーネント
 *
 * @remarks
 * - チャートの各セクションにラベルを表示
 * - 共通テストと二次テストのラベルを特別に処理
 * - パーセンテージ表示をサポート
 * - テキストの位置とスタイルを制御
 *
 * @module PieChartLabel
 */

import { FC } from 'react';
import { CustomLabelProps } from '@/types/charts/pie-chart';
import { RADIAN } from '@/features/charts/constants/chart';
import { formatLabelText } from '@/features/charts/utils/label-formatters';

/**
 * チャートのラベルコンポーネント
 *
 * @remarks
 * - チャートの各セクションにラベルを表示
 * - 共通テストと二次テストのラベルを特別に処理
 * - パーセンテージ表示をサポート
 * - テキストの位置とスタイルを制御
 *
 * @param props - コンポーネントのプロパティ
 * @param props.cx - 円の中心X座標
 * @param props.cy - 円の中心Y座標
 * @param props.midAngle - セクションの中間角度
 * @param props.innerRadius - 内側の半径
 * @param props.outerRadius - 外側の半径
 * @param props.percent - セクションの割合
 * @param props.name - ラベル名
 * @param props.displayName - 表示用のラベル名（オプション）
 * @param props.isRightChart - 右側のグラフかどうか（オプション）
 *
 * @returns ラベル要素またはnull
 */
const CustomLabel: FC<CustomLabelProps> = props => {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent, name, displayName, isRightChart } =
    props;

  const radius = innerRadius + (outerRadius - innerRadius) * (innerRadius === 0 ? 0.75 : 0.5);
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.02) return null;

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
    ? /\((.*?)([LR])\)/.exec(labelText) // 右側グラフの場合
    : /[LR]\(/.exec(labelText); // 左側グラフの場合

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
