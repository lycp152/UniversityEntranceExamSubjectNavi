/**
 * カードフッターコンポーネント
 *
 * @module card-footer
 * @description
 * カードのフッター部分を表示するコンポーネントです。
 */
import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/utils/styles/style-utils';

/**
 * カードフッターコンポーネント
 *
 * @param className - 追加のスタイルクラス
 * @param children - フッター内に表示する子要素
 * @returns カードフッターのJSX
 */
export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn('mt-4', className)} {...props} />
);
CardFooter.displayName = 'CardFooter';
