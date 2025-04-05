/**
 * 試験セクションの型定義
 * 試験セクションのコンポーネントのプロパティ型を定義
 *
 * @module exam-sections
 * @description
 * - 入試情報と試験種別の型定義
 * - スコア変更ハンドラーの型定義
 * - 科目追加ハンドラーの型定義
 * - 科目名変更ハンドラーの型定義
 */

import type { APIAdmissionInfo, APITestType } from '@/types/api/api-response-types';

/** 試験セクションのプロパティ型 */
export interface ExamSectionsProps {
  /** 入試情報と試験種別の配列 */
  admissionInfo: APIAdmissionInfo & {
    testTypes: APITestType[];
  };
  /** 編集モードの状態 */
  isEditing: boolean;
  /** スコア変更時のハンドラー */
  onScoreChange: (subjectId: number, value: number, isCommon: boolean) => void;
  /** 科目追加時のハンドラー */
  onAddSubject?: (type: APITestType) => void;
  /** 科目名変更時のハンドラー */
  onSubjectNameChange: (subjectId: number, name: string) => void;
}
