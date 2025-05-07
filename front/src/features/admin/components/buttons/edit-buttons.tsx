/**
 * 大学情報の編集ボタンコンポーネント
 *
 * このファイルは、大学情報の編集、保存、キャンセル機能を提供する
 * ボタンコンポーネントを定義します。
 */
import { Button } from '@/components/ui/button';
import type { EditButtonsProps } from '@/features/admin/types/university-list';
import { Check, X, Edit } from 'lucide-react';

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
    icon={<Check className="size-6" />}
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
    icon={<X className="size-6" />}
    color="red"
    ariaLabel="キャンセル"
  />
);

/**
 * 編集ボタンコンポーネント
 */
const EditButton = ({ onEdit }: { readonly onEdit: () => void }) => (
  <BaseButton onClick={onEdit} icon={<Edit className="size-6" />} color="blue" ariaLabel="編集" />
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
