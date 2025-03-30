import { DetailedPieData, PieData } from '@/types/charts/pie-chart';
import { BaseTransformParams } from '@/types/charts/transformers';
import { TestType, TEST_TYPES } from '@/types/score';
import { EXAM_TYPES } from '@/constants/subjects';
import { transformSubjectData } from '@/utils/formatters/subject-data-formatter';
import { transformToPieData } from '@/utils/transformers/pie-data-transformer';

const mapTestTypeToSubjectType = (testType: TestType) =>
  testType === TEST_TYPES.COMMON ? EXAM_TYPES.COMMON : EXAM_TYPES.SECONDARY;

export const createDetailedPieData = (
  subjectName: string,
  value: number,
  totalScore: number,
  testType: TestType
): DetailedPieData => {
  const { name, displayName, category } = transformSubjectData(subjectName, testType);
  const transformInput: BaseTransformParams = {
    value,
    totalScore,
    name,
    testTypeId: 0,
    percentage: 0,
    displayOrder: 0,
  };
  const baseData = transformToPieData(transformInput);

  return {
    ...baseData.data,
    category,
    displayName,
    type: mapTestTypeToSubjectType(testType).name,
    testTypeId: mapTestTypeToSubjectType(testType).id,
    displayOrder: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: 1,
    createdBy: 'system',
    updatedBy: 'system',
  };
};

export const createOuterPieData = (category: string, total: number, totalScore: number): PieData =>
  transformToPieData({
    value: total,
    totalScore,
    name: category,
    testTypeId: 0,
    percentage: 0,
    displayOrder: 0,
  }).data;
