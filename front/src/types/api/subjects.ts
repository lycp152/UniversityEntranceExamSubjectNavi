// 科目カテゴリーの型定義
export const SUBJECT_CATEGORIES = {
  ENGLISH_L: "英語L",
  ENGLISH_R: "英語R",
  MATH: "数学",
  JAPANESE: "国語",
  SCIENCE: "理科",
  SOCIAL: "地歴公",
} as const;

export type SubjectCategory =
  (typeof SUBJECT_CATEGORIES)[keyof typeof SUBJECT_CATEGORIES];

// スコアの型定義
export interface SubjectScores {
  commonTest: number;
  secondTest: number;
  maxCommonTest: number;
  maxSecondTest: number;
}

// 学部の型定義
export interface DepartmentModel {
  id: string;
  name: string;
  faculty: string;
}

// データモデルの型定義
export interface SubjectModel {
  id: string;
  name: string;
  category: SubjectCategory;
  scores: SubjectScores;
}

export interface UniversityModel {
  id: string;
  name: string;
  departments: DepartmentModel[];
}

// APIレスポンスの型定義
export interface APISubject {
  id: number;
  name: string;
  score: number;
  percentage: number;
  display_order: number;
  test_type_id: number;
}

export interface APITestType {
  id: number;
  name: string;
  subjects: APISubject[];
}

export interface AdmissionSchedule {
  id: number;
  name: string;
  display_order: number;
  test_types: APITestType[];
}

export interface AdmissionInfo {
  id: number;
  enrollment: number;
  academic_year: number;
  valid_from: string;
  valid_until: string;
  status: string;
  admissionSchedules: AdmissionSchedule[];
}

export interface Major {
  id: number;
  name: string;
  exam_infos: AdmissionInfo[];
}

export interface APIDepartment {
  id: number;
  name: string;
  majors: Major[];
}

export interface APIUniversity {
  id: number;
  name: string;
  departments: APIDepartment[];
}
