import {
  SubjectScores as LibSubjectScores,
  BaseSubjectScore as LibBaseSubjectScore,
} from '@/lib/types/models';

export type TestType = 'commonTest' | 'secondTest';

export interface ScoreData {
  score: number;
  percentage: number;
}

export interface SubjectScoreDetail {
  subject: string;
  commonTest: ScoreData;
  secondaryTest: ScoreData;
  total: ScoreData;
}

export interface ChartScore {
  name: string;
  value: number;
  category: string;
  percentage: number;
}

export type BaseSubjectScore = LibBaseSubjectScore;
export type SubjectScores = LibSubjectScores;
