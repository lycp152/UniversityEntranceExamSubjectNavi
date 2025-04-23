/**
 * 大学情報の編集ボタンコンポーネント
 *
 * このファイルは、大学情報の編集、保存、キャンセル機能を提供する
 * ボタンコンポーネントを定義します。
 */
import { Button } from '@/components/ui/button';
import type { EditButtonsProps } from '@/features/admin/types/university-list';
import { BaseIcon, type IconProps } from '../icons/base-icon';

/**
 * 保存アイコンコンポーネント
 */
const SaveIcon = ({ className }: IconProps) => (
  <BaseIcon className={className}>
    <path
      fillRule="evenodd"
      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
      clipRule="evenodd"
    />
  </BaseIcon>
);

/**
 * キャンセルアイコンコンポーネント
 */
const CancelIcon = ({ className }: IconProps) => (
  <BaseIcon className={className}>
    <path
      fillRule="evenodd"
      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
      clipRule="evenodd"
    />
  </BaseIcon>
);

/**
 * 編集アイコンコンポーネント
 */
const EditIcon = ({ className }: IconProps) => (
  <BaseIcon className={className}>
    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
  </BaseIcon>
);

/**
 * ボタンのカラーバリエーション
 */
type ButtonColor = 'green' | 'red' | 'blue';

/**
 * ベースボタンコンポーネント
 */
interface BaseButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  color: ButtonColor;
  ariaLabel: string;
}

const BaseButton = ({ onClick, icon, color, ariaLabel }: BaseButtonProps) => {
  const colorClasses = {
    green: 'text-green-600 hover:text-green-800 hover:bg-green-50 dark:text-green-400',
    red: 'text-red-600 hover:text-red-800 hover:bg-red-50 dark:text-red-400',
    blue: 'text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:text-blue-400',
  };

  return (
    <Button
      variant="ghost"
      onClick={onClick}
      className={`rounded-full ${colorClasses[color]} p-1.5 [&_svg]:!size-6 size-9`}
      aria-label={ariaLabel}
    >
      {icon}
    </Button>
  );
};

/**
 * 保存ボタンコンポーネント
 */
export const SaveButton = ({ onSave }: { readonly onSave: () => void }) => (
  <BaseButton
    onClick={() => window.confirm('変更を保存しますか？') && onSave()}
    icon={<SaveIcon />}
    color="green"
    ariaLabel="保存"
  />
);

/**
 * キャンセルボタンコンポーネント
 */
export const CancelButton = ({ onCancel }: { readonly onCancel: () => void }) => (
  <BaseButton
    onClick={() => window.confirm('変更は破棄されますが、よろしいですか？') && onCancel()}
    icon={<CancelIcon />}
    color="red"
    ariaLabel="キャンセル"
  />
);

/**
 * 編集ボタンコンポーネント
 */
const EditButton = ({ onEdit }: { readonly onEdit: () => void }) => (
  <BaseButton onClick={onEdit} icon={<EditIcon />} color="blue" ariaLabel="編集" />
);

/**
 * 編集ボタングループコンポーネント
 */
export const EditButtons = ({ isEditing, onEdit, onSave, onCancel }: EditButtonsProps) => {
  if (isEditing) {
    return (
      <div className="flex flex-col space-y-1">
        <SaveButton onSave={onSave} />
        <CancelButton onCancel={onCancel} />
      </div>
    );
  }
  return <EditButton onEdit={onEdit} />;
};
