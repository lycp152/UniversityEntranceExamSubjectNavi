import type { APITestType } from '@/types/api/types';
import type { University, Department } from '@/features/admin/types/university';
import type { EditMode } from '@/features/admin/types/university-list';

/**
 * 共通の状態プロパティ型定義
 *
 * @property error - エラーメッセージ
 * @property isLoading - ローディング状態
 * @property successMessage - 成功メッセージ
 */
export interface CommonStateProps {
  readonly error: string | null;
  readonly isLoading: boolean;
  readonly successMessage: string | null;
}

/**
 * 編集操作のコールバック型定義
 */
export interface EditCallbacks {
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
}

/**
 * 科目操作のコールバック型定義
 */
export interface SubjectCallbacks {
  readonly onAddSubject: (universityId: number, departmentId: number, type: APITestType) => void;
  readonly onSubjectNameChange: (
    universityId: number,
    departmentId: number,
    subjectId: number,
    name: string
  ) => void;
}

/**
 * 管理ページのコンテンツコンポーネントのプロパティ型定義
 *
 * @property universities - 表示する大学データの配列
 * @property editMode - 編集モードの状態
 * @property onInsert - 新規追加時のコールバック
 */
export interface AdminPageContentProps extends CommonStateProps, EditCallbacks, SubjectCallbacks {
  readonly universities: University[];
  readonly editMode: EditMode | null;
  readonly onInsert: (index: number) => void;
}
