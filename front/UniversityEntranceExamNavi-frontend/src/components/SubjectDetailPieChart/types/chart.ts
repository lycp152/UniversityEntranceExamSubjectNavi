export interface PieData {
  name: string;
  value: number;
  percentage: number;
}

export interface DetailedPieData extends PieData {
  category: string;
  displayName: string;
}
