// 科目カテゴリーの型定義
export const SUBJECT_CATEGORIES = {
  ENGLISH: '英語',
  MATH: '数学',
  SCIENCE: '理科',
  SOCIAL: '社会',
} as const;

export type SubjectCategory = (typeof SUBJECT_CATEGORIES)[keyof typeof SUBJECT_CATEGORIES];

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

// コンポーネントのProps型
export interface SubjectCardProps {
  subject: SubjectModel;
  onSelect?: (id: string) => void;
}

export interface ScoreTableProps {
  scores: SubjectScores;
  isLoading?: boolean;
  onScoreUpdate?: (scores: SubjectScores) => void;
}

// カスタムフックの戻り値の型
export interface UseSubjectResult {
  subject: SubjectModel | null;
  isLoading: boolean;
  error: Error | null;
}

// APIレスポンスの型
export interface SubjectApiResponse {
  data: SubjectModel;
  meta: {
    updatedAt: string;
  };
}
