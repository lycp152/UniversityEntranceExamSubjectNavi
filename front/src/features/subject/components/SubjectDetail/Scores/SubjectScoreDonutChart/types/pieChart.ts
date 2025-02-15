import { SubjectType } from '@/features/subject/constants';

// 基本的なデータ変換の入力型
export interface TransformInput {
  value: number;
  totalScore: number;
  name: string;
}

export interface PieData {
  name: string;
  value: number;
  percentage: number;
}

export interface DetailedPieData extends PieData {
  category: string;
  displayName?: string;
  type: SubjectType;
}
