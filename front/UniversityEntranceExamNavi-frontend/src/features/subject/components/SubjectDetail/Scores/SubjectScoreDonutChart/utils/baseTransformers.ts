import { BaseTransformParams, TransformResult } from "../types/transformers";
import { calculatePercentage } from "./calculations";

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
