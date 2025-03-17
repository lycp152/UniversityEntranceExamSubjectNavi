import { DetailedPieData, PieData } from "@/types/subject/chart";
import { TransformInput } from "@/types/subject/transform";
import { TestType, TEST_TYPES } from "@/types/subject/score";
import { SUBJECT_TYPES } from "@/lib/constants/subject";
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
