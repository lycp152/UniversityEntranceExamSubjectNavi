import type { SubjectCategory } from "@/types/subjects";
import type { SubjectScores } from "@/types/api/subjects";

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
    status: string;
  };
  admissionSchedule: {
    id: number;
    name: string;
    displayOrder: number;
  };
  subjects: {
    [key in SubjectCategory]: SubjectScores;
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

// 科目グループの型定義
export interface SubjectGroup {
  testTypeId: number;
  subjects: UISubject[];
  totalScore: number;
  maxTotalScore: number;
  isValid: boolean;
}
