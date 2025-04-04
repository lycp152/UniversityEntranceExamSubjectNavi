import type { APITestType } from '@/types/api/api-response-types';
import type { University, Department } from '@/types/universities/university';
import type { EditMode } from '@/types/universities/university-list';

/**
 * 管理ページのコンテンツコンポーネントのプロパティ型定義
 *
 * @property universities - 表示する大学データの配列
 * @property error - エラーメッセージ
 * @property isLoading - ローディング状態
 * @property successMessage - 成功メッセージ
 * @property editMode - 編集モードの状態
 * @property onEdit - 編集開始時のコールバック
 * @property onInfoChange - 大学情報変更時のコールバック
 * @property onScoreChange - スコア変更時のコールバック
 * @property onSave - 保存時のコールバック
 * @property onCancel - キャンセル時のコールバック
 * @property onInsert - 新規追加時のコールバック
 * @property onAddSubject - 科目追加時のコールバック
 * @property onSubjectNameChange - 科目名変更時のコールバック
 */
export interface AdminPageContentProps {
  readonly universities: University[];
  readonly error: string | null;
  readonly isLoading: boolean;
  readonly successMessage: string | null;
  readonly editMode: EditMode | null;
  readonly onEdit: (university: University, department: Department) => void;
  readonly onInfoChange: (
    universityId: number,
    departmentId: number,
    field: string,
    value: string | number
  ) => void;
  readonly onScoreChange: (
    universityId: number,
    departmentId: number,
    subjectId: number,
    value: number,
    isCommon: boolean
  ) => Promise<void>;
  readonly onSave: (
    university: University,
    department: Department
  ) => Promise<(() => void) | undefined>;
  readonly onCancel: () => void;
  readonly onInsert: (index: number) => void;
  readonly onAddSubject: (universityId: number, departmentId: number, type: APITestType) => void;
  readonly onSubjectNameChange: (
    universityId: number,
    departmentId: number,
    subjectId: number,
    name: string
  ) => void;
}
