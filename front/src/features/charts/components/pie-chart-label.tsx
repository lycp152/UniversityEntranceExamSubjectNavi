/**
 * 円グラフのラベル表示コンポーネント
 *
 * @remarks
 * - 円グラフの各セクションにラベルを表示
 * - 共通テストと二次テストのラベルを特別に処理
 * - パーセンテージ表示をサポート
 * - テキストの位置とスタイルを制御
 *
 * @module PieChartLabel
 */

import { FC } from 'react';
import { CustomLabelProps } from '@/types/charts/pie-chart';

/**
 * ラベルフォーマット戦略の定義
 * @private
 */
const labelFormatters = {
  /**
   * 右側のラベルフォーマット
   * @param {string} name - フォーマットするラベル名
   * @returns {string} フォーマットされたラベル
   */
  right: (name: string) => {
    const regex = /\((.*?)([LR])\)/;
    const match = regex.exec(name);
    return match ? `(${match[1]})\n${match[2]}` : name;
  },
  /**
   * 左側のラベルフォーマット
   * @param {string} name - フォーマットするラベル名
   * @returns {string} フォーマットされたラベル
   */
  left: (name: string) => {
    const regex = /[LR]\(/;
    return regex.exec(name) ? name.replace(/([LR])(\()/, '$1\n$2') : name;
  },
};

/**
 * ラベルテキストをフォーマットする関数
 * @param {string} name - フォーマットするラベル名
 * @param {boolean} isRight - 右側のラベルかどうか
 * @returns {string} フォーマットされたラベルテキスト
 */
const formatLabelText = (name: string, isRight: boolean) => {
  const formatter = labelFormatters[isRight ? 'right' : 'left'];
  return formatter(name);
};

/**
 * 円グラフのラベルコンポーネント
 *
 * @remarks
 * - 円グラフの各セクションにラベルを表示
 * - 共通テストと二次テストのラベルを特別に処理
 * - パーセンテージ表示をサポート
 * - テキストの位置とスタイルを制御
 *
 * @param {CustomLabelProps} props - コンポーネントのプロパティ
 * @param {number} props.cx - 円の中心X座標
 * @param {number} props.cy - 円の中心Y座標
 * @param {number} props.midAngle - セクションの中間角度
 * @param {number} props.innerRadius - 内側の半径
 * @param {number} props.outerRadius - 外側の半径
 * @param {number} props.percent - セクションの割合
 * @param {string} props.name - ラベル名
 * @param {string} [props.displayName] - 表示用のラベル名
 * @param {boolean} [props.isRightChart] - 右側のグラフかどうか
 *
 * @returns {JSX.Element | null} ラベル要素またはnull
 */
const CustomLabel: FC<CustomLabelProps> = props => {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent, name, displayName, isRightChart } =
    props;

  const RADIAN = Math.PI / 180;
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
