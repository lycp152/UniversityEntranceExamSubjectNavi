/**
 * カード説明文コンポーネント
 *
 * @module card-description
 * @description
 * カードの説明文を表示するコンポーネントです。
 */
import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/styles/tailwind-utils';

/**
 * カード説明文コンポーネント
 *
 * @param className - 追加のスタイルクラス
 * @param children - 説明文として表示するテキスト
 * @returns カード説明文のJSX
 */
export const CardDescription = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
));
CardDescription.displayName = 'CardDescription';
