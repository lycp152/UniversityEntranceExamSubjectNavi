/**
 * 管理ページのコンテンツコンポーネント
 *
 * このコンポーネントは以下の機能を提供します：
 * - 大学リストの表示
 * - 編集モードの制御
 * - データの更新処理
 *
 * @param universities - 表示する大学データの配列
 * @param error - エラーメッセージ
 * @param isLoading - ローディング状態
 * @param successMessage - 成功メッセージ
 * @param editMode - 編集モードの状態
 * @param onEdit - 編集開始時のコールバック
 * @param onInfoChange - 大学情報変更時のコールバック
 * @param onScoreChange - スコア変更時のコールバック
 * @param onSave - 保存時のコールバック
 * @param onCancel - キャンセル時のコールバック
 * @param onInsert - 新規追加時のコールバック
 * @param onAddSubject - 科目追加時のコールバック
 * @param onSubjectNameChange - 科目名変更時のコールバック
 */
import type { APITestType } from '@/types/api/api-response-types';
import type { University, Department } from '@/types/universities/university';
import type { EditMode } from '@/types/universities/university-list';
import { UniversityList } from '@/features/admin/components/list';
import { AdminLayout } from '@/features/admin/components/layout';

interface AdminPageContentProps {
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

export function AdminPageContent({
  universities,
  error,
  isLoading,
  successMessage,
  editMode,
  onEdit,
  onInfoChange,
  onScoreChange,
  onSave,
  onCancel,
  onInsert,
  onAddSubject,
  onSubjectNameChange,
}: AdminPageContentProps) {
  return (
    <AdminLayout
      isLoading={isLoading}
      error={error}
      isEmpty={!universities.length}
      successMessage={successMessage}
    >
      <UniversityList
        universities={universities}
        editMode={editMode}
        onEdit={onEdit}
        onInfoChange={onInfoChange}
        onScoreChange={onScoreChange}
        onSave={onSave}
        onCancel={onCancel}
        onInsert={onInsert}
        onAddSubject={onAddSubject}
        onSubjectNameChange={onSubjectNameChange}
      />
    </AdminLayout>
  );
}
