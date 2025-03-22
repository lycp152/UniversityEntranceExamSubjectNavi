import { DetailedPieData, PieData } from "@/features/charts/types";
import { TransformInput } from "@/features/charts/types/ScoreTransformTypes";
import { TestType, TEST_TYPES } from "@/types/score/score";
import { SUBJECT_TYPES } from "@/features/subjects/constants";
import { transformSubjectData } from "./subjectDataTransformers";
import { transformToPieData } from "./baseChartTransformers";

const mapTestTypeToSubjectType = (testType: TestType) =>
  testType === TEST_TYPES.COMMON
    ? SUBJECT_TYPES.COMMON
    : SUBJECT_TYPES.SECONDARY;

export const createDetailedPieData = (
  subjectName: string,
  value: number,
  totalScore: number,
  testType: TestType
): DetailedPieData => {
  const { name, displayName, category } = transformSubjectData(
    subjectName,
    testType
  );
  const transformInput: TransformInput = { value, totalScore, name };
  const baseData = transformToPieData(transformInput);

  return {
    ...baseData.data,
    category,
    displayName,
    type: mapTestTypeToSubjectType(testType),
  };
};

export const createOuterPieData = (
  category: string,
  total: number,
  totalScore: number
): PieData =>
  transformToPieData({
    value: total,
    totalScore,
    name: category,
  }).data;
