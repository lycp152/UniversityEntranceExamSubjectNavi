/**
 * 大学カードコンポーネント
 *
 * 大学情報をカード形式で表示するコンポーネントです。
 * 大学の基本情報と学部情報を表示し、編集モード時には
 * 情報の編集や科目の追加・変更が可能です。
 */
import type { University, Department } from '@/types/university';
import type { APITestType } from '@/types/api/api-response-types';
import { DepartmentRow } from '@/features/admin/components/table/department-row';
import { Card, CardContent } from '@/components/ui/cards';

/**
 * UniversityCardコンポーネントのプロパティ
 */
interface UniversityCardProps {
  /** 表示する大学情報 */
  readonly university: University;
  /** 編集モードの状態 */
  readonly editMode: {
    /** 編集対象の大学ID */
    readonly universityId: number;
    /** 編集対象の学部ID */
    readonly departmentId: number;
    /** 編集モード中かどうか */
    readonly isEditing: boolean;
    /** 新規追加モードかどうか */
    readonly isNew?: boolean;
    /** 挿入位置のインデックス */
    readonly insertIndex?: number;
  } | null;
  /** 編集モードを開始するハンドラー */
  readonly onEdit: (university: University, department: Department) => void;
  /** 変更を保存するハンドラー */
  readonly onSave: (university: University, department: Department) => void;
  /** 編集をキャンセルするハンドラー */
  readonly onCancel: () => void;
  /** 科目の点数を変更するハンドラー */
  readonly onScoreChange: (
    universityId: number,
    departmentId: number,
    subjectId: number,
    value: number,
    isCommon: boolean
  ) => void;
  /** 学部情報を変更するハンドラー */
  readonly onInfoChange: (
    universityId: number,
    departmentId: number,
    field: string,
    value: string | number
  ) => void;
  /** 科目を追加するハンドラー */
  readonly onAddSubject: (universityId: number, departmentId: number, type: APITestType) => void;
  /** 科目名を変更するハンドラー */
  readonly onSubjectNameChange: (
    universityId: number,
    departmentId: number,
    subjectId: number,
    name: string
  ) => void;
}

/**
 * 大学カードコンポーネント
 *
 * 大学情報をカード形式で表示し、編集機能を提供します。
 * 学部ごとにDepartmentRowコンポーネントを表示します。
 */
export const UniversityCard = ({
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
  return (
    <Card className="overflow-hidden bg-white border-gray-100">
      <CardContent className="divide-y divide-gray-100 p-0">
        {university.departments?.map(department => (
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
        ))}
      </CardContent>
    </Card>
  );
};
