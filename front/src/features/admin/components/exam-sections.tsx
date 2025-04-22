import type { ExamSectionsProps } from '@/features/admin/types/exam-sections';
import { ExamSection } from '@/features/admin/components/exam-section';
import type { APITestType } from '@/types/api/types';

/**
 * 試験セクション一覧コンポーネント
 *
 * @module exam-sections
 * @description
 * 共通試験と二次試験のセクションを横並びで表示するコンポーネントです。
 * Next.jsのクライアントコンポーネントとして実装され、Tailwind CSSでスタイリングされています。
 *
 * @features
 * - 共通試験と二次試験のセクションを並列表示
 * - 各セクションのスコア管理
 * - 科目の追加・編集機能の提供
 *
 * @example
 * ```tsx
 * <ExamSections
 *   admissionInfo={admissionInfo}
 *   isEditing={isEditing}
 *   onAddSubject={handleAddSubject}
 * />
 * ```
 */

/**
 * 試験セクション一覧コンポーネント
 * 共通試験と二次試験のセクションを横並びで表示し、それぞれの試験種別に応じた科目とスコアを管理する
 */
export const ExamSections = ({
  admissionInfo,
  isEditing,
  onAddSubject,
  onSubjectNameChange,
  onScoreChange,
}: ExamSectionsProps) => {
  // 共通試験と二次試験の情報を取得
  const commonType = admissionInfo.testTypes?.find((t: APITestType) => t.name === '共通');
  const secondaryType = admissionInfo.testTypes?.find((t: APITestType) => t.name === '二次');

  return (
    <div className="flex-1 flex gap-8">
      {/* 共通試験セクション */}
      {commonType && (
        <div className="flex-1">
          <ExamSection
            subjects={commonType.subjects}
            type={commonType}
            isEditing={isEditing}
            onScoreChange={(subjectId, value) => onScoreChange(subjectId, value, true)}
            onAddSubject={onAddSubject}
            onSubjectNameChange={onSubjectNameChange}
          />
        </div>
      )}
      {/* 二次試験セクション */}
      {secondaryType && (
        <div className="flex-1">
          <ExamSection
            subjects={secondaryType.subjects}
            type={secondaryType}
            isEditing={isEditing}
            onScoreChange={(subjectId, value) => onScoreChange(subjectId, value, false)}
            onAddSubject={onAddSubject}
            onSubjectNameChange={onSubjectNameChange}
          />
        </div>
      )}
    </div>
  );
};
