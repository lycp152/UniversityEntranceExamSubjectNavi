export const TEST_TYPES = {
  COMMON: "common",
  INDIVIDUAL: "individual",
} as const;

export type TestType = (typeof TEST_TYPES)[keyof typeof TEST_TYPES];

export interface BaseScore {
  score: number;
  percentage: number;
}

export interface SubjectScore {
  [TEST_TYPES.COMMON]?: BaseScore;
  [TEST_TYPES.INDIVIDUAL]?: BaseScore;
}

export type SubjectScores = Record<string, SubjectScore>;
