/**
 * カードタイトルコンポーネント
 *
 * @module card-title
 * @description
 * カードのタイトルを表示するコンポーネントです。
 */
import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/utils/styles/style-utils';

/**
 * カードタイトルコンポーネント
 *
 * @param className - 追加のスタイルクラス
 * @param children - タイトルとして表示するテキスト
 * @returns カードタイトルのJSX
 */
export const CardTitle = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, children, ...props }, ref) => (
    <h2
      ref={ref}
      className={cn('text-2xl font-semibold leading-none tracking-tight', className)}
      {...props}
    >
      {children}
    </h2>
  )
);
CardTitle.displayName = 'CardTitle';
