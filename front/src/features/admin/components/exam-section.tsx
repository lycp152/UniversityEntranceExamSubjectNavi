import { useState, useCallback, useMemo } from 'react';
import type { ExamSectionProps } from '../types/types';
import { SubjectList } from './subject/subject-list';

/**
 * 試験セクションコンポーネント
 *
 * @module exam-section
 * @description
 * 試験種別ごとの科目一覧とスコア管理を行うコンポーネントです。
 * - 試験種別ごとの科目一覧の表示
 * - スコアの表示と編集機能
 * - 科目の追加機能
 * - 科目名の編集機能
 *
 * @example
 * ```tsx
 * <ExamSection
 *   subjects={subjects}
 *   type={testType}
 *   isEditing={isEditing}
 *   onScoreChange={handleScoreChange}
 * />
 * ```
 */

/**
 * 試験セクションコンポーネント
 * 試験種別ごとの科目一覧とスコア管理を行うコンポーネント
 */
export const ExamSection = ({
  subjects,
  type,
  isEditing,
  onScoreChange,
  onAddSubject,
  onSubjectNameChange,
}: ExamSectionProps) => {
  const [editValues, setEditValues] = useState<Record<number, number>>({});

  // handleScoreChangeは常に必要（setEditValuesのため）
  const handleScoreChange = useCallback(
    (subjectId: number) => (value: number) => {
      setEditValues(prev => ({ ...prev, [subjectId]: value }));
      if (onScoreChange) {
        onScoreChange(subjectId, value);
      }
    },
    [onScoreChange]
  );

  // 現在の試験タイプに属する科目のみをフィルタリング
  const filteredSubjects = useMemo(
    () => subjects.filter(subject => subject.test_type_id === type.id),
    [subjects, type.id]
  );

  return (
    <div className="w-full">
      <div className="text-xs font-medium mb-2">{type.name}試験</div>
      <SubjectList
        subjects={filteredSubjects}
        type={type}
        isEditing={isEditing}
        editValues={editValues}
        onScoreChange={handleScoreChange}
        onAddSubject={onAddSubject}
        onSubjectNameChange={onSubjectNameChange}
      />
    </div>
  );
};
