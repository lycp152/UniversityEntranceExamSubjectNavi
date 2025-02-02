import { Subject } from './types';

export const subjects: Subject[] = [
  {
    universityId: 1,
    departmentId: 1,
    subjectId: 1,
    universityName: '〇〇大学',
    department: '医学部',
    major: '医学科',
    schedule: '前',
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
  {
    universityId: 2,
    departmentId: 2,
    subjectId: 2,
    universityName: '△△大学',
    department: '工学部',
    major: '機械工学科',
    schedule: '後',
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
  testType: '共通テスト+二次試験',
  subject: '数学',
  attribute: '高い',
  schedule: '前',
};
