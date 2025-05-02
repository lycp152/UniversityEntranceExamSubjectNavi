import { Card } from '@/components/ui/card';
import { ScoreDisplay } from './score-display';
import { SubjectNameDisplay } from './subject-name-display';
import type { SubjectCardProps } from '../../types/types';

/**
 * 科目カードコンポーネント
 *
 * @module subject-card
 * @description
 * 個々の科目の情報を表示・編集するコンポーネントです。
 * Tailwind CSSのユーティリティクラスを使用して、レスポンシブでアクセシブルなデザインを実現します。
 *
 * @features
 * - 科目名の表示と編集
 * - スコアの表示と編集
 * - アクセシビリティ対応
 *
 * @example
 * ```tsx
 * <SubjectCard
 *   subject={subject}
 *   isEditing={isEditing}
 *   editValue={editValue}
 *   onScoreChange={handleScoreChange}
 * />
 * ```
 */
export const SubjectCard = ({
  subject,
  isEditing,
  editValue,
  onScoreChange,
  onNameChange,
}: SubjectCardProps) => {
  return (
    <Card
      className="border rounded-lg bg-background/50 hover:bg-background dark:bg-input/30 dark:hover:bg-input/50 h-16 flex flex-col w-[60px] shadow-sm hover:shadow-md dark:shadow-gray-800 dark:hover:shadow-gray-700 transition-all duration-200 gap-0 py-0"
      aria-label="科目カード"
    >
      <SubjectNameDisplay name={subject.name} isEditing={isEditing} onNameChange={onNameChange} />
      <div className="flex-1 flex items-center justify-center p-1 pt-0.5">
        <ScoreDisplay
          score={editValue}
          percentage={subject.percentage}
          isEditing={isEditing}
          onScoreChange={onScoreChange}
        />
      </div>
    </Card>
  );
};
