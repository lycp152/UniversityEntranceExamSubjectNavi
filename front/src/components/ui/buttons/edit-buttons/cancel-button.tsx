/**
 * キャンセルボタンコンポーネント
 *
 * @module cancel-button
 * @description
 * 編集のキャンセル操作を行うためのボタンコンポーネントです。
 * キャンセル前に確認ダイアログを表示します。
 */
import { Button } from '../button';

interface CancelButtonProps {
  onCancel: () => void;
}

/**
 * キャンセルボタンコンポーネント
 *
 * @param onCancel - キャンセル処理を実行するコールバック関数
 * @returns キャンセルボタンのJSX
 */
export const CancelButton = ({ onCancel }: CancelButtonProps) => (
  <Button
    onClick={() => window.confirm('変更は破棄されますが、よろしいですか？') && onCancel()}
    variant="outline"
    size="icon"
    className="text-red-600 hover:text-red-800 hover:bg-red-50"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
        clipRule="evenodd"
      />
    </svg>
  </Button>
);
