/**
 * ドーナツチャートコンポーネント
 * 内側と外側の2つの円グラフを組み合わせて、科目配点を視覚化します
 */
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { DisplaySubjectScore } from '@/types/score';
import CustomLabel from '@/features/charts/components/pie-chart-label';
import Patterns from '@/features/charts/patterns';
import { ChartTooltip } from '@/features/charts/components/chart-tooltip';
import { getSubjectBaseCategory } from '@/utils/validation/subject-type-validator';
import { CHART_CONFIG } from '@/features/charts/constants/chart';

/**
 * ドーナツチャートのプロパティ型定義
 * @property {DisplaySubjectScore[]} detailedData - 内側の円グラフに表示する詳細データ
 * @property {DisplaySubjectScore[]} outerData - 外側の円グラフに表示する集計データ
 * @property {boolean} [isRightChart] - 右側のチャートかどうかを示すフラグ（デフォルト: false）
 */
type ChartProps = {
  detailedData: DisplaySubjectScore[];
  outerData: DisplaySubjectScore[];
  isRightChart?: boolean;
};

/**
 * チャートの塗りつぶしパターンを取得する関数
 * @param {DisplaySubjectScore} entry - 科目データ
 * @param {boolean} isRightChart - 右側のチャートかどうか
 * @returns {string} パターンのURL
 */
const getChartFillColor = (entry: DisplaySubjectScore, isRightChart: boolean) =>
  `url(#pattern-${isRightChart ? entry.category : getSubjectBaseCategory(entry.name)})`;

// 内側と外側の円グラフで共通して使用するプロパティ
const commonPieProps = {
  cx: CHART_CONFIG.COMMON.CENTER_X,
  cy: CHART_CONFIG.COMMON.CENTER_Y,
  startAngle: CHART_CONFIG.COMMON.START_ANGLE,
  endAngle: CHART_CONFIG.COMMON.END_ANGLE,
};

/**
 * ラベルコンポーネントを生成する関数
 */
const createLabel = (isRightChart: boolean) => {
  const LabelComponent = (props: React.ComponentProps<typeof CustomLabel>) => (
    <CustomLabel {...props} isRightChart={isRightChart} />
  );
  LabelComponent.displayName = 'LabelComponent';
  return LabelComponent;
};

/**
 * ドーナツチャートコンポーネント
 * @param {ChartProps} props - コンポーネントのプロパティ
 * @returns {JSX.Element} ドーナツチャート
 */
export const DonutChart = ({ detailedData, outerData, isRightChart = false }: ChartProps) => {
  const label = createLabel(isRightChart);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsPieChart>
        {/* パターン定義 */}
        <defs>
          <Patterns />
        </defs>

        {/* 内側の円グラフ：詳細データ表示 */}
        <Pie
          {...commonPieProps}
          data={detailedData}
          dataKey="value"
          labelLine={false}
          innerRadius={CHART_CONFIG.INNER_CHART.INNER_RADIUS}
          outerRadius={CHART_CONFIG.INNER_CHART.OUTER_RADIUS}
          label={label}
        >
          {detailedData.map(entry => (
            <Cell key={entry.name} fill={getChartFillColor(entry, isRightChart)} />
          ))}
        </Pie>

        {/* 外側の円グラフ：集計データ表示 */}
        <Pie
          {...commonPieProps}
          data={outerData}
          dataKey="value"
          labelLine={false}
          innerRadius={CHART_CONFIG.OUTER_CHART.INNER_RADIUS}
          outerRadius={CHART_CONFIG.OUTER_CHART.OUTER_RADIUS}
          label={label}
        >
          {outerData.map(entry => (
            <Cell key={entry.name} fill={getChartFillColor(entry, isRightChart)} />
          ))}
        </Pie>
        {/* ツールチップ */}
        <Tooltip formatter={ChartTooltip} />
      </RechartsPieChart>
    </ResponsiveContainer>
  );
};
