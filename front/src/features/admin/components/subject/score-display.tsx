import { useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { SUBJECT_SCORE_CONSTRAINTS } from '@/constants/constraint/subjects/subject-score';
import type { EditScoreProps, AdminScoreDisplayProps, ViewScoreProps } from '../../types/types';
/**
 * スコア表示コンポーネント
 *
 * @module score-display
 * @description
 * 編集モードと表示モードを切り替えてスコアを表示するコンポーネントです。
 * Tailwind CSSのユーティリティクラスを使用して、フォーム要素のスタイリングを実現します。
 * バックエンドのバリデーションルールと同期を保っています。
 *
 * @features
 * - スコアの表示と編集（0-1000の整数）
 * - パーセンテージの表示（0-100、小数点以下2桁）
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
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;

      // 空の入力は0として扱う
      if (value === '') {
        onScoreChange(SUBJECT_SCORE_CONSTRAINTS.MIN_SCORE);
        return;
      }

      // 数値以外の文字を削除
      const numericValue = value.replace(/\D/g, '');

      // 数値に変換（先頭の0は自動的に削除される）
      const parsedValue = parseInt(numericValue, 10);

      // バリデーション: 最小値以上最大値以下の数値
      if (
        !isNaN(parsedValue) &&
        parsedValue >= SUBJECT_SCORE_CONSTRAINTS.MIN_SCORE &&
        parsedValue <= SUBJECT_SCORE_CONSTRAINTS.MAX_SCORE
      ) {
        onScoreChange(parsedValue);
      }
    },
    [onScoreChange]
  );

  return (
    <Input
      value={score}
      onChange={handleInputChange}
      className="text-xs w-[50px] h-6 p-1 text-center"
      inputMode="numeric"
      pattern="[0-9]*"
      aria-label="スコア"
      aria-required="true"
      aria-invalid={
        score < SUBJECT_SCORE_CONSTRAINTS.MIN_SCORE || score > SUBJECT_SCORE_CONSTRAINTS.MAX_SCORE
      }
    />
  );
};

/**
 * スコア表示コンポーネント
 * 表示モード時にスコアとパーセンテージを表示するコンポーネント
 */
const ViewScore = ({ score, percentage }: ViewScoreProps) => (
  <>
    <output
      className="text-xs font-semibold whitespace-nowrap text-center w-[50px]"
      aria-label="スコア"
    >
      {score}点
    </output>
    <output
      className="text-[10px] text-gray-500 dark:text-gray-300 whitespace-nowrap text-center w-[50px]"
      aria-label="パーセンテージ"
    >
      ({percentage.toFixed(SUBJECT_SCORE_CONSTRAINTS.DEFAULT_DECIMAL_PLACES)}%)
    </output>
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
}: AdminScoreDisplayProps) => (
  <fieldset
    className="flex flex-col h-full justify-center w-full border-0 p-0 m-0"
    aria-label={isEditing ? 'スコア編集' : 'スコア表示'}
  >
    {isEditing ? (
      <EditScore score={score} onScoreChange={onScoreChange} />
    ) : (
      <ViewScore score={score} percentage={percentage} />
    )}
  </fieldset>
);
