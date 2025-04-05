/**
 * カードコンポーネント
 *
 * @module card
 * @description
 * コンテンツをカード形式で表示するための基本コンポーネントです。
 * 白背景と影を持つ共通のカードレイアウトを提供します。
 */
import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/utils/styles/style-utils';

/**
 * カードコンポーネント
 *
 * @param className - 追加のスタイルクラス
 * @param children - カード内に表示する子要素
 * @returns カードコンテナのJSX
 */
export const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('bg-white shadow rounded-lg', className)} {...props} />
  )
);
Card.displayName = 'Card';
