import type { APITestType, APISubject } from '@/types/api/types';

/**
 * 管理画面の型定義
 *
 * @remarks
 * - 管理画面用の型定義
 * - スコア表示コンポーネントの型定義
 */

/**
 * スコア編集コンポーネントのプロパティ型定義
 * @property score - 表示するスコア
 * @property onScoreChange - スコア変更時のコールバック関数
 */
export type EditScoreProps = {
  score: number;
  onScoreChange: (score: number) => void;
};

/**
 * スコア表示コンポーネントのプロパティ型定義
 * @property score - 表示するスコア
 * @property percentage - 表示するパーセンテージ
 */
export type ViewScoreProps = {
  score: number;
  percentage: number;
};

/**
 * 管理画面用スコア表示コンポーネントのプロパティ型定義
 * @property isEditing - 編集モードかどうか
 * @property score - 表示するスコア
 * @property percentage - 表示するパーセンテージ
 * @property onScoreChange - スコア変更時のコールバック関数
 */
export type AdminScoreDisplayProps = {
  isEditing: boolean;
  score: number;
  percentage: number;
  onScoreChange: (score: number) => void;
};

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
