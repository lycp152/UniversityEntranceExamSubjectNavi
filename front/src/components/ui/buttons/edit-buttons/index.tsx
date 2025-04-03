/**
 * 編集ボタンコンポーネント
 *
 * @module edit-buttons
 * @description
 * データの編集、保存、キャンセル操作を行うためのボタンコンポーネント群です。
 * アイコンベースのボタンを使用し、直感的なUIを提供します。
 *
 * @features
 * - 編集モードの切り替え
 * - 保存時の確認ダイアログ
 * - キャンセル時の確認ダイアログ
 * - アクセシビリティ対応
 */
import type { EditButtonsProps } from '@/types/universities/university-list';
import { SaveButton } from './save-button';
import { CancelButton } from './cancel-button';
import { EditButton } from './edit-button';

/**
 * 編集ボタンコンテナコンポーネント
 *
 * @param isEditing - 編集モードの状態
 * @param onEdit - 編集モードを開始するコールバック関数
 * @param onSave - 保存処理を実行するコールバック関数
 * @param onCancel - キャンセル処理を実行するコールバック関数
 * @returns 編集モードに応じたボタンコンポーネントのJSX
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
