import { SubjectTableData } from '../../types/subject';

export const MOCK_TABLE_DATA: SubjectTableData[] = [
  {
    subject: '英語L',
    commonTest: {
      score: 100,
      percentage: 12.5,
    },
    secondaryTest: {
      score: 75,
      percentage: 15.0,
    },
    total: {
      score: 175,
      percentage: 13.5,
    },
  },
  {
    subject: '英語R',
    commonTest: {
      score: 100,
      percentage: 12.5,
    },
    secondaryTest: {
      score: 75,
      percentage: 15.0,
    },
    total: {
      score: 175,
      percentage: 13.5,
    },
  },
  {
    subject: '数学',
    commonTest: {
      score: 200,
      percentage: 25.0,
    },
    secondaryTest: {
      score: 100,
      percentage: 20.0,
    },
    total: {
      score: 300,
      percentage: 23.1,
    },
  },
  {
    subject: '国語',
    commonTest: {
      score: 200,
      percentage: 25.0,
    },
    secondaryTest: {
      score: 100,
      percentage: 20.0,
    },
    total: {
      score: 300,
      percentage: 23.1,
    },
  },
  {
    subject: '理科',
    commonTest: {
      score: 100,
      percentage: 12.5,
    },
    secondaryTest: {
      score: 100,
      percentage: 20.0,
    },
    total: {
      score: 200,
      percentage: 15.4,
    },
  },
  {
    subject: '地歴公',
    commonTest: {
      score: 100,
      percentage: 12.5,
    },
    secondaryTest: {
      score: 50,
      percentage: 10.0,
    },
    total: {
      score: 150,
      percentage: 11.4,
    },
  },
];

// 合計値（参考用）
export const TOTAL_SCORES = {
  commonTest: 800, // 共通テスト合計
  secondaryTest: 500, // 二次試験合計
  total: 1300, // 総合計
};
