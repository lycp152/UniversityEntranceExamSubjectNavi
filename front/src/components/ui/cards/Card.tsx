/**
 * カードコンポーネント
 *
 * @module card
 * @description
 * コンテンツをカード形式で表示するための基本コンポーネントです。
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
    <div
      ref={ref}
      className={cn('rounded-lg border bg-card text-card-foreground shadow-sm', className)}
      {...props}
    />
  )
);
Card.displayName = 'Card';
