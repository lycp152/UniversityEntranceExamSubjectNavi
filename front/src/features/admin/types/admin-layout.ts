import { ReactNode } from 'react';

/**
 * 管理ページのレイアウトコンポーネントのプロパティ型定義
 *
 * @property children - レイアウト内に表示する子コンポーネント
 * @property isLoading - ローディング状態を示すフラグ
 * @property error - エラーメッセージ
 * @property isEmpty - データが空かどうかを示すフラグ
 * @property successMessage - 成功メッセージ
 */
export interface AdminLayoutProps {
  readonly children: ReactNode;
  readonly isLoading?: boolean;
  readonly error?: string | null;
  readonly isEmpty?: boolean;
  readonly successMessage?: string | null;
}
