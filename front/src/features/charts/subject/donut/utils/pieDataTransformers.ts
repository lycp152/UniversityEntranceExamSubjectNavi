import {
  BaseTransformParams,
  TransformResult,
} from "../types/pieDataTransformerTypes";
import { calculatePercentage } from "@/utils/math/percentage";

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
