import {
  EXAM_TYPE_OPTIONS,
  SUBJECT_NAME_DISPLAY_MAPPING,
  SUBJECT_MAIN_CATEGORIES,
} from '../constants/subjects';

// 基本的な型定義
export type ExamType = (typeof EXAM_TYPE_OPTIONS)[number];
export type SubjectMainCategory = (typeof SUBJECT_MAIN_CATEGORIES)[number];
export type SubjectNameDisplay =
  (typeof SUBJECT_NAME_DISPLAY_MAPPING)[keyof typeof SUBJECT_NAME_DISPLAY_MAPPING];

// スコア関連の型
export interface BaseScore {
  score: number;
  maxScore: number;
  percentage: number;
}

export interface TestScores {
  commonTest: BaseScore;
  secondTest: BaseScore;
  total: BaseScore;
}

export interface BaseSubjectScore {
  commonTest: number;
  secondTest: number;
}

export type SubjectName = '英語R' | '英語L' | '数学' | '国語' | '理科' | '地歴公';
export type SubjectScores = Record<SubjectName, BaseSubjectScore>;

export const TEST_TYPES = {
  COMMON: 'commonTest',
  SECOND: 'secondTest',
} as const;

export type TestType = (typeof TEST_TYPES)[keyof typeof TEST_TYPES];

// 表示関連の型
export interface TitleData {
  testType: string;
  subject: string;
  attribute: string;
  schedule: string;
}

// 計算結果関連の型
export interface ScoreCalculation {
  totalScore: number;
  categoryTotal: number;
  percentage: number;
}

// バリデーション関連の型
export interface ValidationError {
  code: string;
  message: string;
  field?: string;
}

export interface ValidationResult<T> {
  isValid: boolean;
  data?: T;
  errors: ValidationError[];
}

/**
 * 科目名と表示名のマッピング型
 * 各科目名に対する表示用の文字列を定義
 */
export type SubjectNameDisplayMapping = {
  readonly 英語R: '英語（リーディング）';
  readonly 英語L: '英語（リスニング）';
  readonly '英語R + L': '英語（総合）';
  readonly 数学: '数学';
  readonly 国語: '国語';
  readonly 理科: '理科';
  readonly 地歴公: '地理歴史・公民';
};

// チャート関連の型
export interface ChartData {
  name: string;
  value: number;
  color: string;
  percentage: string;
  score: string;
  category?: string;
}

export interface ChartDataSet {
  detailedData: ChartData[];
  outerData: ChartData[];
  errors: ValidationError[];
}

// 科目関連の型
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
  subjects: SubjectScores;
}

export interface SubjectScore {
  type: TestType;
  value: number;
  subjectName: SubjectName;
}

export interface SubjectScoreError {
  type: 'error';
  message: string;
  subjectName: SubjectName;
}
