import { useCallback, useMemo } from 'react';
import type { SubjectListProps } from '../types/types';
import { SubjectCard } from './subject-card';
import { Button } from '@/components/ui/button';

/**
 * 科目リストコンポーネント
 *
 * @module subject-list
 * @description
 * 科目カードのリストと科目追加ボタンを表示するコンポーネントです。
 * Tailwind CSSのユーティリティクラスを使用して、フレックスレイアウトを実現します。
 *
 * @features
 * - 科目カードのリスト表示
 * - 科目の表示順序によるソート
 * - 科目追加ボタンの表示
 *
 * @example
 * ```tsx
 * <SubjectList
 *   subjects={subjects}
 *   type={type}
 *   isEditing={isEditing}
 *   onAddSubject={handleAddSubject}
 * />
 * ```
 */

export const SubjectList = ({
  subjects,
  type,
  isEditing,
  editValues,
  onScoreChange,
  onAddSubject,
  onSubjectNameChange,
}: SubjectListProps) => {
  // 科目を表示順序でソート
  const sortedSubjects = useMemo(
    () => [...subjects].sort((a, b) => a.display_order - b.display_order),
    [subjects]
  );

  // onSubjectNameChangeが存在する場合のみ関数を生成
  const handleNameChange = useCallback(
    (subjectId: number) => (name: string) => {
      if (onSubjectNameChange) {
        onSubjectNameChange(subjectId, name);
      }
    },
    [onSubjectNameChange]
  );

  return (
    <div className="flex gap-1">
      {sortedSubjects.map(subject => (
        <SubjectCard
          key={subject.id}
          subject={subject}
          isEditing={isEditing}
          editValue={editValues[subject.id] ?? subject.score ?? 0}
          onScoreChange={onScoreChange(subject.id)}
          onNameChange={onSubjectNameChange ? handleNameChange(subject.id) : () => {}}
        />
      ))}
      {isEditing && onAddSubject && (
        <Button
          onClick={() => onAddSubject(type)}
          variant="outline"
          className="border border-dashed border-gray-300 rounded-lg h-16 w-[60px] flex flex-col items-center justify-center hover:bg-gray-50 transition-colors group"
          aria-label="科目を追加"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-400 group-hover:text-gray-500"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-xs text-gray-400 group-hover:text-gray-500 mt-1">追加</span>
        </Button>
      )}
    </div>
  );
};
