/**
 * 保存ボタンコンポーネント
 *
 * @module save-button
 * @description
 * データの保存操作を行うためのボタンコンポーネントです。
 * 保存前に確認ダイアログを表示します。
 */
import { Button } from '../button';

interface SaveButtonProps {
  onSave: () => void;
}

/**
 * 保存ボタンコンポーネント
 *
 * @param onSave - 保存処理を実行するコールバック関数
 * @returns 保存ボタンのJSX
 */
export const SaveButton = ({ onSave }: SaveButtonProps) => (
  <Button
    onClick={() => window.confirm('変更を保存しますか？') && onSave()}
    variant="outline"
    size="icon"
    className="text-green-600 hover:text-green-800 hover:bg-green-50"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  </Button>
);
