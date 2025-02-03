export type CustomLabelProps = {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
  name: string;
  displayName?: string;
  isRightChart?: boolean;
};

export type SubjectScore = {
  name: string; // 科目名（例：英語L, 英語R）
  category: string; // カテゴリ（共通/二次）
  value: number; // 点数
  percentage: number; // 割合
  displayName?: string;
};

export type SubjectTableData = {
  subject: string; // 基本科目名（英語、数学など）
  commonTest: {
    score: number; // 共通テスト配点
    percentage: number; // 共通テスト内での割合
  };
  secondaryTest: {
    score: number; // 二次試験配点
    percentage: number; // 二次試験内での割合
  };
  total: {
    score: number; // 総配点
    percentage: number; // 全体での割合
  };
};
