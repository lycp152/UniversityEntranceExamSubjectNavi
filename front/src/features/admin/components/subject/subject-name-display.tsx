import { Input } from '@/components/ui/input';
import { SUBJECT_NAME_CONSTRAINTS } from '@/constants/constraint/subjects/subjects';

/**
 * 科目名表示コンポーネント
 *
 * @module subject-name-display
 * @description
 * 科目名の入力と表示を担当するコンポーネントです。
 * Tailwind CSSのユーティリティクラスを使用して、フォーム要素のスタイリングを実現します。
 * バックエンドのバリデーションルールと同期を保っています。
 *
 * @features
 * - 科目名の表示と編集
 * - 入力値のバリデーション（1-20文字、空文字不可、特殊文字不可）
 * - アクセシビリティ対応
 *
 * @example
 * ```tsx
 * <SubjectNameDisplay
 *   name={name}
 *   isEditing={isEditing}
 *   onNameChange={handleNameChange}
 * />
 * ```
 */

interface SubjectNameDisplayProps {
  /** 科目名 */
  name: string;
  /** 編集モードかどうか */
  isEditing: boolean;
  /** 科目名変更時のコールバック */
  onNameChange: (value: string) => void;
}

export const SubjectNameDisplay = ({ name, isEditing, onNameChange }: SubjectNameDisplayProps) => {
  const handleNameChange = (value: string) => {
    // 特殊文字と制御文字を削除
    const sanitizedValue = value.replace(/[^\p{L}\p{N}\p{Z}]/gu, '');

    // 最大長を超える場合はトリム
    const trimmedValue = sanitizedValue.slice(0, SUBJECT_NAME_CONSTRAINTS.MAX_LENGTH);

    onNameChange(trimmedValue);
  };

  if (isEditing) {
    return (
      <Input
        type="text"
        value={name}
        onChange={e => handleNameChange(e.target.value)}
        className="text-xs p-1 text-center"
        placeholder="科目名"
        maxLength={SUBJECT_NAME_CONSTRAINTS.MAX_LENGTH}
        aria-label="科目名"
        aria-required={SUBJECT_NAME_CONSTRAINTS.NOT_EMPTY}
        aria-invalid={name.length === 0 || name.length > SUBJECT_NAME_CONSTRAINTS.MAX_LENGTH}
      />
    );
  }

  return (
    <div className="text-xs px-1 pt-1.5 pb-0.5 text-center" aria-label="科目名">
      {name}
    </div>
  );
};
