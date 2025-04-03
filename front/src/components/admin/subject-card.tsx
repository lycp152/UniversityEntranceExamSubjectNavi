import type { SubjectCardProps } from './types';
import { ScoreDisplay } from './score-display';

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
    <div className="border border-gray-100 rounded-lg bg-gray-50 h-16 flex flex-col w-[60px]">
      {isEditing ? (
        <input
          type="text"
          value={subject.name}
          onChange={e => onNameChange(e.target.value)}
          className="text-xs font-medium text-gray-900 py-1.5 px-1 text-center border-b border-gray-100 bg-gray-100 truncate focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="科目名"
        />
      ) : (
        <div className="text-xs font-medium text-gray-900 py-1.5 px-1 text-center border-b border-gray-100 bg-gray-100 truncate">
          {subject.name}
        </div>
      )}
      <div className="flex-1 flex items-center justify-center p-1">
        <ScoreDisplay
          score={editValue}
          percentage={subject.percentage}
          isEditing={isEditing}
          onScoreChange={onScoreChange}
        />
      </div>
    </div>
  );
};
