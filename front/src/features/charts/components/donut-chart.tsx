/**
 * ドーナツチャートコンポーネント
 * 内側と外側の2つの円グラフを組み合わせて、科目配点を視覚化します
 */
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { DisplaySubjectScore } from '@/types/score';
import CustomLabel from './chart-label';
import Patterns from './pattern-renderer';
import { ChartTooltip } from './chart-tooltip';
import { getSubjectBaseCategory } from '../utils/subject-type-validator';
import { CHART, COMMON_PIE_PROPS } from '../constants/chart';
import { ChartProps } from '../types/chart';

/**
 * チャートの塗りつぶしパターンを取得する関数
 * @param {DisplaySubjectScore} entry - 科目データ
 * @param {boolean} isRightChart - 右側のチャートかどうか
 * @returns {string} パターンのURL
 */
const getChartFillColor = (entry: DisplaySubjectScore, isRightChart: boolean) =>
  `url(#pattern-${isRightChart ? entry.category : getSubjectBaseCategory(entry.name)})`;

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
  const chartTitle = isRightChart ? '二次試験科目配点' : '共通テスト科目配点';

  return (
    <figure aria-label={chartTitle} className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          {/* パターン定義 */}
          <defs>
            <Patterns />
          </defs>

          {/* 内側の円グラフ：詳細データ表示 */}
          <Pie
            {...COMMON_PIE_PROPS}
            data={detailedData}
            dataKey="value"
            labelLine={false}
            innerRadius={CHART.INNER_CHART.INNER_RADIUS}
            outerRadius={CHART.INNER_CHART.OUTER_RADIUS}
            label={label}
            nameKey="name"
          >
            {detailedData.map(entry => (
              <Cell
                key={entry.name}
                fill={getChartFillColor(entry, isRightChart)}
                aria-label={`${entry.name}: ${entry.value}点`}
              />
            ))}
          </Pie>

          {/* 外側の円グラフ：集計データ表示 */}
          <Pie
            {...COMMON_PIE_PROPS}
            data={outerData}
            dataKey="value"
            labelLine={false}
            innerRadius={CHART.OUTER_CHART.INNER_RADIUS}
            outerRadius={CHART.OUTER_CHART.OUTER_RADIUS}
            label={label}
            nameKey="name"
          >
            {outerData.map(entry => (
              <Cell
                key={entry.name}
                fill={getChartFillColor(entry, isRightChart)}
                aria-label={`${entry.name}: ${entry.value}点`}
              />
            ))}
          </Pie>
          {/* ツールチップ */}
          <Tooltip formatter={ChartTooltip} />
        </PieChart>
      </ResponsiveContainer>
    </figure>
  );
};
