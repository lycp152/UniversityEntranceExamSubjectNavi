import { DetailedPieData, PieData, TransformInput } from '@/features/subject/types';
import { TestType } from '@/lib/types';
import { transformSubjectData } from './subjectDataTransformers';
import { transformToPieData } from './baseChartTransformers';

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
    type: testType,
  };
};

export const createOuterPieData = (category: string, total: number, totalScore: number): PieData =>
  transformToPieData({
    value: total,
    totalScore,
    name: category,
  }).data;
