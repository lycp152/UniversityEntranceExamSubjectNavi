// recharts PieDataの代替定義
export type PieData = {
  name: string;
  value: number;
  percentage?: number; // オプショナルに変更
};

// 科目スコアの基本型
export type SubjectScore = PieData & {
  // PieDataを継承
  percentage: number; // 必須に上書き
  category: string;
};

// ドーナツチャートのProps
export type ChartProps = {
  detailedData: SubjectScore[]; // PieData & { category: string } から SubjectScore に変更
  outerData: SubjectScore[]; // PieData & { category: string } から SubjectScore に変更
  isRightChart?: boolean;
};

// カスタムラベルのProps
export type CustomLabelProps = {
  cx: number; // 中心のX座標
  cy: number; // 中心のY座標
  midAngle: number; // 中間角度
  innerRadius: number; // 内側の半径
  outerRadius: number; // 外側の半径
  percent: number; // パーセンテージ
  name: string; // 表示名
  displayName?: string; // 代替表示名
  isRightChart?: boolean; // 右側のグラフかどうか
};
