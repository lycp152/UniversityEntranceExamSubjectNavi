/**
 * 大学リストコンポーネント
 *
 * このコンポーネントは以下の機能を提供します：
 * - 大学リストの表示とソート
 * - 新規大学の追加ボタンの表示
 * - 編集モードの制御
 *
 * @param universities - 表示する大学データの配列
 * @param editMode - 編集モードの状態
 * @param onEdit - 編集開始時のコールバック
 * @param onSave - 保存時のコールバック
 * @param onCancel - キャンセル時のコールバック
 * @param onScoreChange - スコア変更時のコールバック
 * @param onInfoChange - 大学情報変更時のコールバック
 * @param onInsert - 新規追加時のコールバック
 * @param onAddSubject - 科目追加時のコールバック
 * @param onSubjectNameChange - 科目名変更時のコールバック
 */
import React from 'react';
import type { UniversityListProps } from '@/features/admin/types/university-list';
import { UniversityCard } from '@/features/admin/components/card/university-card';
import { InsertUniversityButton } from '@/features/admin/components/buttons/insert-button';
import { sortUniversities } from '../../utils/sort-universities';
import type { University } from '@/features/admin/types/university';

export const UniversityList = ({
  universities,
  editMode,
  onEdit,
  onSave,
  onCancel,
  onScoreChange,
  onInfoChange,
  onInsert,
  onAddSubject,
  onSubjectNameChange,
}: UniversityListProps) => {
  // 編集モードでない場合のみ挿入ボタンを表示
  const showInsertButtons = !editMode?.isEditing;

  // 大学データを安定的にソート
  const sortedUniversities = sortUniversities(universities, editMode);

  return (
    <div className="space-y-2">
      {showInsertButtons && (
        <InsertUniversityButton
          onInsert={onInsert}
          index={0}
          isOnly={sortedUniversities.length === 0}
        />
      )}
      {sortedUniversities.map((university: University, index: number) => (
        <React.Fragment key={`university-${university.id ?? index}`}>
          <UniversityCard
            university={university}
            editMode={editMode}
            onEdit={onEdit}
            onSave={onSave}
            onCancel={onCancel}
            onScoreChange={onScoreChange}
            onInfoChange={onInfoChange}
            onAddSubject={onAddSubject}
            onSubjectNameChange={onSubjectNameChange}
          />
          {showInsertButtons && <InsertUniversityButton onInsert={onInsert} index={index + 1} />}
        </React.Fragment>
      ))}
    </div>
  );
};
