/**
 * 編集ボタンコンポーネント
 *
 * @module edit-button
 * @description
 * 編集モードを開始するためのボタンコンポーネントです。
 */
import { Button } from '../button';

interface EditButtonProps {
  onEdit: () => void;
}

/**
 * 編集ボタンコンポーネント
 *
 * @param onEdit - 編集モードを開始するコールバック関数
 * @returns 編集ボタンのJSX
 */
export const EditButton = ({ onEdit }: EditButtonProps) => (
  <Button
    onClick={onEdit}
    variant="outline"
    size="icon"
    className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
    </svg>
  </Button>
);
