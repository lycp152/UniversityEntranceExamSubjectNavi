import { PieData } from './pieChart';

export interface TransformedSubjectData {
  name: string;
  displayName: string;
  category: string;
}

export interface BaseTransformParams {
  value: number;
  totalScore: number;
  name: string;
}

export type TransformResult = {
  data: PieData;
  metadata?: {
    category?: string;
    displayName?: string;
  };
};
