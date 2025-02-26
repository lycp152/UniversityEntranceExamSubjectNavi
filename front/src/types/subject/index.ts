// 科目カテゴリーの型定義
export const SUBJECT_CATEGORIES = {
  ENGLISH: "英語",
  MATH: "数学",
  SCIENCE: "理科",
  SOCIAL: "社会",
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

// UIの型定義
export interface UISubject {
  id: number;
  name: string;
  score: number;
  percentage: number;
  displayOrder: number;
  testTypeId: number;
  university: {
    id: number;
    name: string;
  };
  department: {
    id: number;
    name: string;
  };
  major: {
    id: number;
    name: string;
  };
  examInfo: {
    id: number;
    enrollment: number;
    academicYear: number;
    validFrom: string;
    validUntil: string;
    status: string;
  };
  admissionSchedule: {
    id: number;
    name: string;
    displayOrder: number;
  };
}

// コンポーネントのProps型
export interface SubjectCardProps {
  subject: UISubject;
  onSelect?: (id: number) => void;
}

export interface ScoreTableProps {
  subjectData: UISubject;
  isLoading?: boolean;
}

// カスタムフックの戻り値の型
export interface UseSubjectResult {
  subject: UISubject | null;
  isLoading: boolean;
  error: Error | null;
}

// APIレスポンスの型
export interface SubjectApiResponse {
  data: UISubject;
  meta: {
    updatedAt: string;
  };
}
