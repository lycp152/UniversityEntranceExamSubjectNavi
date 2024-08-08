export interface Subject {
  universityId: number;
  departmentId: number;
  subjectId: number;
  rank: number;
  subjectRatio: number;
  universityName: string;
  department: string;
  major: string;
  schedule: string;
  enrollment: number;
  commonTestScore: number;
  commonTestRatio: number;
  secondTestScore: number;
  secondTestRatio: number;
  totalScore: number;
  totalRatio: number;
  subjectScores: {
    [key: string]: {
      commonTestScore: number;
      commonTestRatio: number;
      secondTestScore: number;
      secondTestRatio: number;
      totalScore: number;
      totalRatio: number;
    };
  };
}
export const subjects: Subject[] = [
  {
    universityId: 1,
    departmentId: 1,
    subjectId: 1,
    rank: 1,
    subjectRatio: 75.29,
    universityName: "〇〇大学",
    department: "医学部",
    major: "医学科",
    schedule: "前",
    enrollment: 100,
    commonTestScore: 150,
    commonTestRatio: 75,
    secondTestScore: 50,
    secondTestRatio: 25,
    totalScore: 200,
    totalRatio: 100,
    subjectScores: {
      英語R: {
        commonTestScore: 50,
        commonTestRatio: 5.56,
        secondTestScore: 150,
        secondTestRatio: 16.67,
        totalScore: 250,
        totalRatio: 27.78,
      },
      英語L: {
        commonTestScore: 50,
        commonTestRatio: 5.56,
        secondTestScore: 0,
        secondTestRatio: 0,
        totalScore: 50,
        totalRatio: 5.56,
      },
      "英語R + L": {
        commonTestScore: 100,
        commonTestRatio: 11.11,
        secondTestScore: 150,
        secondTestRatio: 16.67,
        totalScore: 250,
        totalRatio: 27.78,
      },
      数学: {
        commonTestScore: 100,
        commonTestRatio: 11.11,
        secondTestScore: 150,
        secondTestRatio: 16.67,
        totalScore: 250,
        totalRatio: 27.78,
      },
      国語: {
        commonTestScore: 100,
        commonTestRatio: 11.11,
        secondTestScore: 0,
        secondTestRatio: 0,
        totalScore: 100,
        totalRatio: 11.11,
      },
      理科: {
        commonTestScore: 200,
        commonTestRatio: 22.22,
        secondTestScore: 0,
        secondTestRatio: 0,
        totalScore: 200,
        totalRatio: 22.22,
      },
      地歴公: {
        commonTestScore: 50,
        commonTestRatio: 5.56,
        secondTestScore: 0,
        secondTestRatio: 0,
        totalScore: 50,
        totalRatio: 5.56,
      },
      配点合計: {
        commonTestScore: 550,
        commonTestRatio: 61.11,
        secondTestScore: 350,
        secondTestRatio: 38.89,
        totalScore: 900,
        totalRatio: 100,
      },
    },
  },
  // 追加のデモデータ
  {
    universityId: 2,
    departmentId: 2,
    subjectId: 2,
    rank: 2,
    subjectRatio: 65.5,
    universityName: "△△大学",
    department: "工学部",
    major: "機械工学科",
    schedule: "後",
    enrollment: 150,
    commonTestScore: 200,
    commonTestRatio: 80,
    secondTestScore: 50,
    secondTestRatio: 20,
    totalScore: 250,
    totalRatio: 100,
    subjectScores: {
      英語R: {
        commonTestScore: 70,
        commonTestRatio: 7.0,
        secondTestScore: 150,
        secondTestRatio: 15.0,
        totalScore: 220,
        totalRatio: 22.0,
      },
      数学: {
        commonTestScore: 130,
        commonTestRatio: 13.0,
        secondTestScore: 150,
        secondTestRatio: 15.0,
        totalScore: 280,
        totalRatio: 28.0,
      },
      理科: {
        commonTestScore: 150,
        commonTestRatio: 15.0,
        secondTestScore: 100,
        secondTestRatio: 10.0,
        totalScore: 250,
        totalRatio: 25.0,
      },
      配点合計: {
        commonTestScore: 350,
        commonTestRatio: 35.0,
        secondTestScore: 400,
        secondTestRatio: 40.0,
        totalScore: 750,
        totalRatio: 75.0,
      },
    },
  },
];

export const titleData = {
  testType: "共通テスト+二次試験",
  subject: "数学",
  attribute: "高い",
  schedule: "前",
};

export const subjectNames = [
  "英語R",
  "英語L",
  "英語R + L",
  "数学",
  "国語",
  "理科",
  "地歴公",
  "配点合計",
];
