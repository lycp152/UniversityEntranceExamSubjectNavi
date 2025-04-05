import type { APITestType, APISubject } from '@/types/api/api-response-types';

/**
 * スコア表示コンポーネントのプロパティ型
 */
export interface ScoreDisplayProps {
  /** スコア値 */
  score: number;
  /** パーセンテージ値 */
  percentage: number;
  /** 編集モードの状態 */
  isEditing: boolean;
  /** スコア変更時のハンドラー */
  onScoreChange: (value: number) => void;
}

/** スコア編集コンポーネントのプロパティ型 */
export type EditScoreProps = Omit<ScoreDisplayProps, 'percentage' | 'isEditing'>;

/** スコア表示コンポーネントのプロパティ型 */
export type ViewScoreProps = Omit<ScoreDisplayProps, 'isEditing' | 'onScoreChange'>;

/**
 * 科目カードコンポーネントのプロパティ型
 */
export interface SubjectCardProps {
  /** 科目情報 */
  subject: APISubject;
  /** 編集モードの状態 */
  isEditing: boolean;
  /** 編集中のスコア値 */
  editValue: number;
  /** スコア変更時のハンドラー */
  onScoreChange: (value: number) => void;
  /** 科目名変更時のハンドラー */
  onNameChange: (name: string) => void;
}

/**
 * 科目リストコンポーネントのプロパティ型
 */
export interface SubjectListProps {
  /** 科目の配列 */
  subjects: APISubject[];
  /** 試験種別情報 */
  type: APITestType;
  /** 編集モードの状態 */
  isEditing: boolean;
  /** 編集中のスコア値のマップ */
  editValues: Record<number, number>;
  /** スコア変更時のハンドラー */
  onScoreChange: (subjectId: number) => (value: number) => void;
  /** 科目追加時のハンドラー */
  onAddSubject?: (type: APITestType) => void;
  /** 科目名変更時のハンドラー */
  onSubjectNameChange?: (subjectId: number, name: string) => void;
}

/**
 * 試験セクションコンポーネントのプロパティ型
 */
export interface ExamSectionProps {
  /** 科目の配列 */
  subjects: APISubject[];
  /** 試験種別情報 */
  type: APITestType;
  /** 編集モードの状態 */
  isEditing: boolean;
  /** スコア変更時のハンドラー */
  onScoreChange?: (subjectId: number, value: number) => void;
  /** 科目追加時のハンドラー */
  onAddSubject?: (type: APITestType) => void;
  /** 科目名変更時のハンドラー */
  onSubjectNameChange?: (subjectId: number, name: string) => void;
}
