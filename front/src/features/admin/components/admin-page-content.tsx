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
import type { AdminPageContentProps } from '../types/admin-props';
import type { University, Department } from '@/features/admin/types/university';
import type { APITestType } from '@/types/api/types';
import { UniversityList } from '@/features/admin/components/lists/university-list';
import { AdminLayout } from '@/features/admin/components/layout';
import { memo, useMemo, useCallback } from 'react';

export const AdminPageContent = memo(function AdminPageContent({
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
}: Readonly<AdminPageContentProps>) {
  const isEmpty = useMemo(() => !universities.length, [universities.length]);

  const handleEdit = useCallback(
    (university: University, department: Department) => {
      onEdit(university, department);
    },
    [onEdit]
  );

  const handleInfoChange = useCallback(
    (universityId: number, departmentId: number, field: string, value: string | number) => {
      onInfoChange(universityId, departmentId, field, value);
    },
    [onInfoChange]
  );

  const handleScoreChange = useCallback(
    (
      universityId: number,
      departmentId: number,
      subjectId: number,
      value: number,
      isCommon: boolean
    ) => {
      onScoreChange(universityId, departmentId, subjectId, value, isCommon);
    },
    [onScoreChange]
  );

  const handleSave = useCallback(
    (university: University, department: Department) => {
      onSave(university, department);
    },
    [onSave]
  );

  const handleCancel = useCallback(() => {
    onCancel();
  }, [onCancel]);

  const handleInsert = useCallback(
    (index: number) => {
      onInsert(index);
    },
    [onInsert]
  );

  const handleAddSubject = useCallback(
    (universityId: number, departmentId: number, type: APITestType) => {
      onAddSubject(universityId, departmentId, type);
    },
    [onAddSubject]
  );

  const handleSubjectNameChange = useCallback(
    (universityId: number, departmentId: number, subjectId: number, name: string) => {
      onSubjectNameChange(universityId, departmentId, subjectId, name);
    },
    [onSubjectNameChange]
  );

  return (
    <AdminLayout
      isLoading={isLoading}
      error={error}
      isEmpty={isEmpty}
      successMessage={successMessage}
    >
      <UniversityList
        universities={universities}
        editMode={editMode}
        onEdit={handleEdit}
        onInfoChange={handleInfoChange}
        onScoreChange={handleScoreChange}
        onSave={handleSave}
        onCancel={handleCancel}
        onInsert={handleInsert}
        onAddSubject={handleAddSubject}
        onSubjectNameChange={handleSubjectNameChange}
      />
    </AdminLayout>
  );
});
