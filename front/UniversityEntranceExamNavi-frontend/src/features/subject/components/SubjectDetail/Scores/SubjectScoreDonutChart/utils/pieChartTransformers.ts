import { DetailedPieData, PieData, TransformInput } from '@/features/subject/types';
import { TestType } from '@/lib/types';
import { SUBJECT_TYPES } from '@/features/subject/constants';
import { transformSubjectData } from './subjectDataTransformers';
import { transformToPieData } from './baseChartTransformers';

const mapTestTypeToSubjectType = (testType: TestType) =>
  testType === 'commonTest' ? SUBJECT_TYPES.COMMON : SUBJECT_TYPES.SECONDARY;

export const createDetailedPieData = (
  subjectName: string,
  value: number,
  totalScore: number,
  testType: TestType
): DetailedPieData => {
  const { name, displayName, category } = transformSubjectData(subjectName, testType);
  const transformInput: TransformInput = { value, totalScore, name };
  const baseData = transformToPieData(transformInput);

  return {
    ...baseData.data,
    category,
    displayName,
    type: mapTestTypeToSubjectType(testType),
  };
};

export const createOuterPieData = (category: string, total: number, totalScore: number): PieData =>
  transformToPieData({
    value: total,
    totalScore,
    name: category,
  }).data;
