import { SubjectScores } from '@/lib/types';

export interface TestScores {
  subjects: SubjectScores;
  totals: {
    all: number;
    commonTest: number;
    secondTest: number;
  };
  categories: {
    english: {
      total: number;
      commonTest: number;
      secondTest: number;
    };
  };
}

export const testData: TestScores = {
  subjects: {
    英語R: { commonTest: 100, secondTest: 200, maxCommonTest: 200, maxSecondTest: 300 },
    英語L: { commonTest: 50, secondTest: 150, maxCommonTest: 100, maxSecondTest: 200 },
    数学: { commonTest: 200, secondTest: 300, maxCommonTest: 200, maxSecondTest: 400 },
    国語: { commonTest: 0, secondTest: 0, maxCommonTest: 200, maxSecondTest: 200 },
    理科: { commonTest: 0, secondTest: 0, maxCommonTest: 200, maxSecondTest: 200 },
    地歴公: { commonTest: 0, secondTest: 0, maxCommonTest: 100, maxSecondTest: 100 },
  },
  totals: {
    all: 1000, // (100 + 200) + (50 + 150) + (200 + 300)
    commonTest: 350, // 100 + 50 + 200
    secondTest: 650, // 200 + 150 + 300
  },
  categories: {
    english: {
      total: 500, // (100 + 200) + (50 + 150)
      commonTest: 150, // 100 + 50
      secondTest: 350, // 200 + 150
    },
  },
};
