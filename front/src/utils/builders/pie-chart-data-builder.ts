import { DetailedPieData, PieData } from "@/types/charts/pie-chart";
import { BaseTransformParams } from "@/types/charts/transformers";
import { TestType, TEST_TYPES } from "@/types/score";
import { EXAM_TYPES } from "@/constants/subjects";
import { transformSubjectData } from "@/utils/formatters/subject-data-formatter";
import { transformToPieData } from "@/utils/transformers/pie-data";

const mapTestTypeToSubjectType = (testType: TestType) =>
  testType === TEST_TYPES.COMMON ? EXAM_TYPES.COMMON : EXAM_TYPES.SECONDARY;

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
  const transformInput: BaseTransformParams = { value, totalScore, name };
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
