/**
 * 大学カードコンポーネント
 *
 * 大学情報をカード形式で表示するコンポーネントです。
 * 大学の基本情報と学部情報を表示し、編集モード時には
 * 情報の編集や科目の追加・変更が可能です。
 */
import { useMemo } from 'react';
import type { University } from '@/features/admin/types/university';
import { DepartmentRow } from '@/features/admin/components/table/department-row';
import { Card, CardContent } from '@/components/ui/card';
import type { UniversityListProps, EditMode } from '@/features/admin/types/university-list';

/**
 * UniversityCardコンポーネントのプロパティ
 */
interface UniversityCardProps
  extends Pick<
    UniversityListProps,
    | 'onEdit'
    | 'onSave'
    | 'onCancel'
    | 'onScoreChange'
    | 'onInfoChange'
    | 'onAddSubject'
    | 'onSubjectNameChange'
  > {
  /** 表示する大学情報 */
  readonly university: University;
  /** 編集モードの状態 */
  readonly editMode: EditMode | null;
}

/**
 * 学部行リストコンポーネント
 *
 * 大学の学部情報をリスト形式で表示します。
 * 編集モードの状態に応じて、各学部の編集状態を管理します。
 */
const DepartmentList = ({
  university,
  editMode,
  onEdit,
  onSave,
  onCancel,
  onScoreChange,
  onInfoChange,
  onAddSubject,
  onSubjectNameChange,
}: UniversityCardProps) => {
  const departments = useMemo(
    () =>
      university.departments?.map(department => (
        <DepartmentRow
          key={`department-${university.id}-${department.id}`}
          university={university}
          department={department}
          isEditing={
            editMode?.universityId === university.id &&
            editMode?.departmentId === department.id &&
            editMode?.isEditing
          }
          onEdit={onEdit}
          onSave={onSave}
          onCancel={onCancel}
          onScoreChange={onScoreChange}
          onInfoChange={onInfoChange}
          onAddSubject={type => onAddSubject(university.id, department.id, type)}
          onSubjectNameChange={(subjectId, name) =>
            onSubjectNameChange(university.id, department.id, subjectId, name)
          }
        />
      )),
    [
      university,
      editMode,
      onEdit,
      onSave,
      onCancel,
      onScoreChange,
      onInfoChange,
      onAddSubject,
      onSubjectNameChange,
    ]
  );

  return <>{departments}</>;
};

/**
 * 大学カードコンポーネント
 *
 * 大学情報をカード形式で表示し、編集機能を提供します。
 * 学部ごとにDepartmentRowコンポーネントを表示します。
 */
export const UniversityCard = (props: UniversityCardProps) => {
  return (
    <article aria-label={`${props.university.name}の情報`}>
      <Card className="overflow-hidden py-1 hover:bg-gray-50 dark:hover:bg-gray-900">
        <CardContent className="divide-y divide-gray-100 p-0">
          <DepartmentList {...props} />
        </CardContent>
      </Card>
    </article>
  );
};
