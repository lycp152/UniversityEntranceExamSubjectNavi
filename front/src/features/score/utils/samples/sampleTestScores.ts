import { SubjectScores } from "@/types/score";

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
    英語R: {
      commonTest: 100,
      secondTest: 200,
    },
    英語L: {
      commonTest: 50,
      secondTest: 150,
    },
    数学: {
      commonTest: 200,
      secondTest: 300,
    },
    国語: {
      commonTest: 0,
      secondTest: 0,
    },
    理科: {
      commonTest: 0,
      secondTest: 0,
    },
    地歴公: {
      commonTest: 0,
      secondTest: 0,
    },
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
