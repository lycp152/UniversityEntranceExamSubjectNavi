import { DetailedPieData, PieData } from '../types/chart';
import { TestType } from '@/lib/types';
import { transformSubjectData } from './subjectDataTransformers';
import { transformToPieData } from './baseTransformers';

export const createDetailedPieData = (
  subjectName: string,
  value: number,
  totalScore: number,
  testType: TestType
): DetailedPieData => {
  const { name, displayName, category } = transformSubjectData(subjectName, testType);
  const { data: baseData } = transformToPieData({ value, totalScore, name });

  return {
    ...baseData,
    category,
    displayName,
  };
};

export const createOuterPieData = (
  category: string,
  total: number,
  totalScore: number
): PieData => {
  const { data } = transformToPieData({
    value: total,
    totalScore,
    name: category,
  });
  return data;
};
