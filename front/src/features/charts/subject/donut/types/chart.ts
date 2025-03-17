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
  detailedData: DetailedPieData[];
  outerData: OuterPieData[];
}
