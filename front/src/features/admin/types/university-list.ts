/**
 * 大学一覧の型定義
 * 大学一覧の表示と編集に関する型定義を管理
 *
 * @module university-list
 * @description
 * - 編集モードの型定義
 * - 編集ボタンのプロパティ型定義
 * - 学部行のプロパティ型定義
 * - 大学一覧のプロパティ型定義
 */

import type { University, Department } from '@/features/admin/types/university';
import type { APITestType } from '@/types/api/types';

/** 編集モードの状態を管理する型 */
export interface EditMode {
  /** 編集対象の大学ID */
  universityId: number;
  /** 編集対象の学部ID */
  departmentId: number;
  /** 編集モードの状態 */
  isEditing: boolean;
  /** 新規作成モードかどうか */
  isNew?: boolean;
  /** 新規作成時の挿入位置 */
  insertIndex?: number;
}

/** 編集ボタンのプロパティ型 */
export interface EditButtonsProps {
  /** 編集モードの状態 */
  isEditing: boolean;
  /** 編集開始時のハンドラー */
  onEdit: () => void;
  /** 保存実行時のハンドラー */
  onSave: () => void;
  /** 編集キャンセル時のハンドラー */
  onCancel: () => void;
}

/** 行のプロパティ型 */
export interface RowProps {
  /** 表示・編集対象の大学情報 */
  university: University;
  /** 表示・編集対象の学部情報 */
  department: Department;
  /** 編集モードの状態 */
  isEditing: boolean;
  /** 編集開始時のハンドラー */
  onEdit: (university: University, department: Department) => void;
  /** 保存実行時のハンドラー */
  onSave: (university: University, department: Department) => void;
  /** 編集キャンセル時のハンドラー */
  onCancel: () => void;
  /** スコア変更時のハンドラー */
  onScoreChange: (
    universityId: number,
    departmentId: number,
    subjectId: number,
    value: number,
    isCommon: boolean
  ) => void;
  /** 情報変更時のハンドラー */
  onInfoChange: (
    universityId: number,
    departmentId: number,
    field: string,
    value: string | number
  ) => void;
  /** 科目追加時のハンドラー */
  onAddSubject: (type: APITestType) => void;
  /** 科目名変更時のハンドラー */
  onSubjectNameChange: (subjectId: number, name: string) => void;
}

/** 大学一覧のプロパティ型 */
export interface UniversityListProps {
  /** 表示対象の大学一覧 */
  readonly universities: University[];
  /** 編集モードの状態情報 */
  readonly editMode: EditMode | null;
  /** 編集開始時のハンドラー */
  readonly onEdit: (university: University, department: Department) => void;
  /** 保存実行時のハンドラー */
  readonly onSave: (university: University, department: Department) => void;
  /** 編集キャンセル時のハンドラー */
  readonly onCancel: () => void;
  /** スコア変更時のハンドラー */
  readonly onScoreChange: (
    universityId: number,
    departmentId: number,
    subjectId: number,
    value: number,
    isCommon: boolean
  ) => void;
  /** 情報変更時のハンドラー */
  readonly onInfoChange: (
    universityId: number,
    departmentId: number,
    field: string,
    value: string | number
  ) => void;
  /** 新規作成時のハンドラー */
  readonly onInsert: (index: number) => void;
  /** 科目追加時のハンドラー */
  readonly onAddSubject: (universityId: number, departmentId: number, type: APITestType) => void;
  /** 科目名変更時のハンドラー */
  readonly onSubjectNameChange: (
    universityId: number,
    departmentId: number,
    subjectId: number,
    name: string
  ) => void;
}
