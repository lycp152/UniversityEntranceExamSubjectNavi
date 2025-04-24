import type { EditScoreProps, ScoreDisplayProps, ViewScoreProps } from '../../types/types';

/**
 * スコア表示コンポーネント
 *
 * @module score-display
 * @description
 * 編集モードと表示モードを切り替えてスコアを表示するコンポーネントです。
 * Tailwind CSSのユーティリティクラスを使用して、フォーム要素のスタイリングを実現します。
 *
 * @features
 * - スコアの表示と編集
 * - パーセンテージの表示
 * - 入力値のバリデーション
 *
 * @example
 * ```tsx
 * <ScoreDisplay
 *   score={score}
 *   percentage={percentage}
 *   isEditing={isEditing}
 *   onScoreChange={handleScoreChange}
 * />
 * ```
 */

const EditScore = ({ score, onScoreChange }: EditScoreProps) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onScoreChange(Number(e.target.value));
  };

  return (
    <input
      type="number"
      value={score}
      onChange={handleInputChange}
      className="text-xs font-semibold text-gray-900 dark:text-gray-100 w-[50px] text-center border border-blue-300 dark:border-blue-500 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
      min="0"
    />
  );
};

/**
 * スコア表示コンポーネント
 * 表示モード時にスコアとパーセンテージを表示するコンポーネント
 */
const ViewScore = ({ score, percentage }: ViewScoreProps) => (
  <>
    <div className="text-xs font-semibold whitespace-nowrap text-center w-[50px]">{score}点</div>
    <div className="text-[10px] text-gray-500 dark:text-gray-300 whitespace-nowrap text-center w-[50px]">
      （{percentage.toFixed(1)}%）
    </div>
  </>
);

/**
 * スコア表示コンポーネント
 * 編集モードと表示モードを切り替えてスコアを表示するコンポーネント
 */
export const ScoreDisplay = ({
  isEditing,
  score,
  percentage,
  onScoreChange,
}: ScoreDisplayProps) => (
  <div className="flex flex-col h-full justify-center w-full">
    {isEditing ? (
      <EditScore score={score} onScoreChange={onScoreChange} />
    ) : (
      <ViewScore score={score} percentage={percentage} />
    )}
  </div>
);
