import { SubjectCategory } from "@/types/subject";

interface DetailedPieData {
  name: string;
  value: number;
  category: SubjectCategory;
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
