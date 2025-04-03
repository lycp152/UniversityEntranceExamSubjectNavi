/**
 * カードコンテンツコンポーネント
 *
 * @module card-content
 * @description
 * カードのメインコンテンツを表示するコンポーネントです。
 */
import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/utils/styles/style-utils';

/**
 * カードコンテンツコンポーネント
 *
 * @param className - 追加のスタイルクラス
 * @param children - コンテンツとして表示する要素
 * @returns カードコンテンツのJSX
 */
export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
  )
);
CardContent.displayName = 'CardContent';
