/**
 * 管理ページのメインコンポーネント
 *
 * このコンポーネントは以下の機能を提供します：
 * - 大学データの取得と管理
 * - 編集モードの制御
 * - エラーバウンダリーによるエラー処理
 *
 * @remarks
 * このコンポーネントはクライアントコンポーネントとして実装されており、
 * データフェッチングと状態管理を行います。
 */
'use client';

import { useEffect, ReactElement } from 'react';
import { useUniversityEditor } from '@/features/admin/hooks/use-university-editor';
import { AdminPageContent } from './content';
import { ErrorBoundary } from '@/features/admin/components/errors/error-boundary';

export function AdminPage(): ReactElement {
  // 大学データの編集に関する状態と関数を取得
  const {
    universities,
    error,
    isLoading,
    successMessage,
    fetchUniversities,
    editMode,
    handleEdit,
    handleCancel,
    handleSave,
    handleInfoChange,
    handleScoreChange,
    handleAddSubject,
    handleSubjectNameChange,
    handleInsert,
  } = useUniversityEditor();

  // コンポーネントマウント時に大学データを取得
  useEffect(() => {
    fetchUniversities().catch(error => {
      console.error('Failed to fetch universities:', error);
    });
  }, [fetchUniversities]);

  return (
    <ErrorBoundary>
      <AdminPageContent
        universities={universities}
        error={error}
        isLoading={isLoading}
        successMessage={successMessage}
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
    </ErrorBoundary>
  );
}
