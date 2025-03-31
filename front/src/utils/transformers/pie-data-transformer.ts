import { BaseTransformParams, TransformResult } from '@/types/charts/transformers';
import { calculatePercentage } from '@/utils/math/percentage';

export const transformToPieData = ({
  value,
  totalScore,
  name,
}: BaseTransformParams): TransformResult => ({
  data: {
    name,
    value,
    percentage: calculatePercentage(value, totalScore),
  },
});
