import { SubjectName } from "@/constants/subjects2";

interface DetailedPieData {
  name: string;
  value: number;
  category: SubjectName;
}

interface OuterPieData {
  name: string;
  value: number;
  percentage: number;
}

export interface ChartData {
  name: string;
  value: number;
  color: string;
  percentage: number;
  score: string;
  category?: string;
  detailedData?: DetailedPieData[];
  outerData?: OuterPieData[];
}
