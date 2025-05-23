import { useCallback, useMemo } from 'react';
import type { SubjectListProps } from '../../types/score';
import { SubjectCard } from './subject-card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

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
    <div className="grid grid-cols-[repeat(auto-fill,minmax(60px,1fr))] gap-2">
      {sortedSubjects.map((subject, index) => (
        <SubjectCard
          key={`${subject.id}-${index}`}
          subject={subject}
          isEditing={isEditing}
          editValue={editValues[subject.id] ?? subject.score ?? 0}
          onScoreChange={onScoreChange(subject.id)}
          onNameChange={onSubjectNameChange ? handleNameChange(subject.id) : () => {}}
        />
      ))}
      {isEditing && onAddSubject && (
        <Button
          onClick={() => {
            console.log('SubjectList: 科目追加が呼び出されました。タイプ:', type);
            onAddSubject(type);
          }}
          variant="outline"
          className="
            flex flex-col items-center justify-center
            h-16 w-full

            border border-dashed
            bg-background/50 hover:bg-background dark:bg-input/30 dark:hover:bg-input/100

            rounded-lg
            group
          "
          aria-label="科目を追加"
        >
          <Plus
            className="
              h-5 w-5
              text-gray-500 dark:text-gray-300
              group-hover:text-gray-600 dark:group-hover:text-gray-200
            "
          />
          <span
            className="
            text-xs mt-1
            text-gray-500 dark:text-gray-300
            group-hover:text-gray-600 dark:group-hover:text-gray-200
          "
          >
            追加
          </span>
        </Button>
      )}
    </div>
  );
};
