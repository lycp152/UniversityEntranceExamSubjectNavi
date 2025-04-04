import {
  SubjectScores as LibSubjectScores,
  BaseSubjectScore as LibBaseSubjectScore,
} from "@/types/score";

export type TestType = "commonTest" | "secondTest";

export interface ScoreData {
  score: number;
  percentage: number;
}

export interface ChartScore {
  name: string;
  value: number;
  category: string;
  percentage: number;
}

export type BaseSubjectScore = LibBaseSubjectScore;
export type SubjectScores = LibSubjectScores;
