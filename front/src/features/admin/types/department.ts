/**
 * 学部情報の型定義
 * 学部情報の表示と編集に関する型定義を管理
 *
 * @module department
 * @description
 * - 学部情報のプロパティ型定義
 * - 編集機能の型定義
 */

import type { Department, University } from '@/features/admin/types/university';

/** 学部情報のプロパティ型 */
export interface DepartmentInfoProps {
  /** 表示・編集対象の学部情報 */
  department: Department;
  /** 学部が所属する大学情報 */
  university: University;
  /** 編集モードの状態 */
  isEditing: boolean;
  /** 学部情報の変更を処理するハンドラー */
  onInfoChange: (field: string, value: string | number) => void;
}
