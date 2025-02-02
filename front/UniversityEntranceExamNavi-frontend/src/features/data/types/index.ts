import {
  EXAM_TYPE_OPTIONS,
  SUBJECT_NAME_DISPLAY_MAPPING,
  SUBJECT_MAIN_CATEGORIES,
} from '../constants/subjects';

// 基本的な型定義
export type TestType = (typeof EXAM_TYPE_OPTIONS)[number];
export type SubjectMainCategory = (typeof SUBJECT_MAIN_CATEGORIES)[number];
export type SubjectNameDisplay =
  (typeof SUBJECT_NAME_DISPLAY_MAPPING)[keyof typeof SUBJECT_NAME_DISPLAY_MAPPING];

// スコア関連の型
export interface BaseSubjectScore {
  commonTest: number;
  secondTest: number;
}

export interface DetailedSubjectScore {
  type: TestType;
  value: number;
  subjectName: SubjectName;
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

export type SubjectScores = {
  英語R: BaseSubjectScore;
  英語L: BaseSubjectScore;
  数学: BaseSubjectScore;
  国語: BaseSubjectScore;
  理科: BaseSubjectScore;
  地歴公: BaseSubjectScore;
};

export type SubjectName = keyof SubjectScores;

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
export interface ValidationMetadata {
  processedAt: number;
  totalItems: number;
  successCount: number;
  errorCount: number;
}

export interface ValidationResult<T> {
  isValid: boolean;
  data?: T;
  errors: SubjectScoreError[];
  metadata?: ValidationMetadata;
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
  errors: SubjectScoreError[];
}
