/**
 * 学部行コンポーネント
 *
 * 大学の学部情報を表示するための行コンポーネントです。
 * 学部情報と試験情報を横並びで表示し、編集機能を提供します。
 */
import type { DepartmentRowProps } from '@/features/admin/types/university-list';
import { EditButtons } from '@/features/admin/components/buttons/edit-buttons';
import { DepartmentInfo } from '@/features/admin/components/department-info/department-info';
import { ExamSections } from '@/features/admin/components/exam-sections';
import type { APIAdmissionInfo, APITestType, APISubject } from '@/types/api/types';

/**
 * 学部行コンポーネント
 *
 * @param university - 表示・編集対象の大学情報
 * @param department - 表示・編集対象の学部情報
 * @param isEditing - 編集モードの状態
 * @param onEdit - 編集開始時のハンドラー
 * @param onSave - 保存実行時のハンドラー
 * @param onCancel - 編集キャンセル時のハンドラー
 * @param onScoreChange - スコア変更時のハンドラー
 * @param onInfoChange - 情報変更時のハンドラー
 * @param onAddSubject - 科目追加時のハンドラー
 * @param onSubjectNameChange - 科目名変更時のハンドラー
 */
export const DepartmentRow = ({
  university,
  department,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onScoreChange,
  onInfoChange,
  onAddSubject,
  onSubjectNameChange,
}: DepartmentRowProps) => {
  const major = department.majors[0];
  const admissionSchedule = major?.admissionSchedules?.[0];
  const admissionInfo = admissionSchedule?.admissionInfos?.[0];

  if (!major || !admissionSchedule || !admissionInfo) return null;

  /**
   * スコア変更を処理するハンドラー
   *
   * @param subjectId - 変更対象の科目ID
   * @param value - 新しいスコア値
   * @param isCommon - 共通試験かどうか
   */
  const handleScoreChange = (subjectId: number, value: number, isCommon: boolean) =>
    onScoreChange(university.id, department.id, subjectId, value, isCommon);

  // Convert TestType and Subject to their API counterparts
  const mappedTestTypes: APITestType[] = admissionSchedule.testTypes.map(testType => ({
    id: testType.id,
    admission_schedule_id: testType.admissionScheduleId,
    name: testType.name,
    subjects: testType.subjects.map(subject => ({
      id: subject.id,
      test_type_id: testType.id,
      name: subject.name,
      score: subject.score || 0,
      percentage: subject.percentage || 0,
      display_order: subject.displayOrder,
      created_at: subject.createdAt,
      updated_at: subject.updatedAt,
      deleted_at: subject.deletedAt ?? null,
      version: subject.version,
      created_by: subject.createdBy,
      updated_by: subject.updatedBy,
    })) as APISubject[],
    created_at: testType.createdAt,
    updated_at: testType.updatedAt,
    deleted_at: testType.deletedAt ?? null,
    version: testType.version,
    created_by: testType.createdBy,
    updated_by: testType.updatedBy,
  }));

  /**
   * APIレスポンス形式に変換した入試情報
   * ExamSectionsコンポーネントに渡すために必要な形式に変換
   */
  const mappedAdmissionInfo: APIAdmissionInfo & { testTypes: APITestType[] } = {
    id: admissionInfo.id,
    admission_schedule_id: admissionInfo.admissionScheduleId,
    academic_year: admissionInfo.academicYear,
    enrollment: admissionInfo.enrollment,
    status: admissionInfo.status,
    created_at: admissionInfo.createdAt,
    updated_at: admissionInfo.updatedAt,
    version: admissionInfo.version,
    created_by: admissionInfo.createdBy,
    updated_by: admissionInfo.updatedBy,
    admission_schedule: {
      id: admissionSchedule.id,
      major_id: admissionSchedule.majorId,
      name: admissionSchedule.name,
      display_order: admissionSchedule.displayOrder,
      test_types: mappedTestTypes,
      admission_infos: [],
      created_at: admissionSchedule.createdAt,
      updated_at: admissionSchedule.updatedAt,
      deleted_at: admissionSchedule.deletedAt ?? null,
      version: admissionSchedule.version,
      created_by: admissionSchedule.createdBy,
      updated_by: admissionSchedule.updatedBy,
    },
    test_types: mappedTestTypes,
    testTypes: mappedTestTypes,
  };

  return (
    <div className="px-4 py-3 transition-colors">
      <div className="flex items-start min-w-max">
        <div className="flex-shrink-0 pr-4">
          <EditButtons
            isEditing={isEditing}
            onEdit={() => onEdit(university, department)}
            onSave={() => onSave(university, department)}
            onCancel={onCancel}
          />
        </div>
        <div className="flex-1 flex items-start gap-4">
          <DepartmentInfo
            department={department}
            university={university}
            isEditing={isEditing}
            onInfoChange={(field, value) =>
              onInfoChange(university.id, department.id, field, value)
            }
          />
          <ExamSections
            admissionInfo={mappedAdmissionInfo}
            isEditing={isEditing}
            onScoreChange={handleScoreChange}
            onAddSubject={onAddSubject}
            onSubjectNameChange={onSubjectNameChange}
          />
        </div>
      </div>
    </div>
  );
};
