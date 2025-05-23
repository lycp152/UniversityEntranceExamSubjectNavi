/**
 * 基本情報の型定義
 * 基本情報の表示と編集に関する型定義を管理
 *
 * @module department
 * @description
 * - 基本情報のプロパティ型定義
 * - 編集機能の型定義
 */

import type {
  University,
  Department,
  Major,
  AdmissionSchedule,
  AdmissionInfo,
} from '@/features/admin/types/university';

/** 基本情報のプロパティ型 */
export interface BasicInfoProps {
  /** 表示・編集対象の大学情報 */
  readonly university: University;
  /** 表示・編集対象の学部情報 */
  readonly department: Department;
  /** 表示・編集対象の学科情報 */
  readonly major: Major;
  /** 表示・編集対象の入試日程情報 */
  readonly admissionSchedule: AdmissionSchedule;
  /** 表示・編集対象の入試情報（募集人数） */
  readonly admissionInfo: AdmissionInfo;
  /** 編集モードの状態 */
  readonly isEditing: boolean;
  /** 基本情報の変更を処理するハンドラー */
  readonly onInfoChange: (field: string, value: string | number) => void;
}
