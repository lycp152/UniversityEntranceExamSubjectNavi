import { ReactNode } from 'react';
import type { CommonStateProps } from './common-props';

/**
 * 管理ページのレイアウトコンポーネントのプロパティ型定義
 *
 * @property children - レイアウト内に表示する子コンポーネント
 * @property isLoading - ローディング状態を示すフラグ
 * @property error - エラーメッセージ
 * @property isEmpty - データが空かどうかを示すフラグ
 * @property successMessage - 成功メッセージ
 */
export interface AdminLayoutProps extends CommonStateProps {
  readonly children: ReactNode;
  readonly isEmpty?: boolean;
}
