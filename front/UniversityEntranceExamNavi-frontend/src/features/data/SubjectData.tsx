export interface SubjectScore {
  commonTest: number; // 共通テストの点数
  secondTest: number; // 二次試験の点数
}

export interface Subject {
  universityId: number;
  departmentId: number;
  subjectId: number;
  universityName: string;
  department: string;
  major: string;
  schedule: string;
  enrollment: number;
  rank: number;
  subjectRatio: number;
  subjects: {
    英語R: SubjectScore;
    英語L: SubjectScore;
    数学: SubjectScore;
    国語: SubjectScore;
    理科: SubjectScore;
    地歴公: SubjectScore;
  };
}

export const subjects: Subject[] = [
  {
    universityId: 1,
    departmentId: 1,
    subjectId: 1,
    universityName: "〇〇大学",
    department: "医学部",
    major: "医学科",
    schedule: "前",
    enrollment: 100,
    rank: 1,
    subjectRatio: 35.5,
    subjects: {
      英語L: {
        commonTest: 50,
        secondTest: 0,
      },
      英語R: {
        commonTest: 50,
        secondTest: 150,
      },
      数学: {
        commonTest: 100,
        secondTest: 150,
      },
      国語: {
        commonTest: 100,
        secondTest: 0,
      },
      理科: {
        commonTest: 200,
        secondTest: 0,
      },
      地歴公: {
        commonTest: 50,
        secondTest: 0,
      },
    },
  },
  // 追加のデモデータ
  {
    universityId: 2,
    departmentId: 2,
    subjectId: 2,
    universityName: "△△大学",
    department: "工学部",
    major: "機械工学科",
    schedule: "後",
    enrollment: 150,
    rank: 2,
    subjectRatio: 32.8,
    subjects: {
      英語L: {
        commonTest: 50,
        secondTest: 0,
      },
      英語R: {
        commonTest: 70,
        secondTest: 150,
      },
      数学: {
        commonTest: 130,
        secondTest: 150,
      },
      国語: {
        commonTest: 100,
        secondTest: 0,
      },
      理科: {
        commonTest: 150,
        secondTest: 100,
      },
      地歴公: {
        commonTest: 50,
        secondTest: 0,
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
