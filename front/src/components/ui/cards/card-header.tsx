/**
 * カードヘッダーコンポーネント
 *
 * @module card-header
 * @description
 * カードのヘッダー部分を表示するコンポーネントです。
 */
import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/utils/styles/style-utils';

/**
 * カードヘッダーコンポーネント
 *
 * @param className - 追加のスタイルクラス
 * @param children - ヘッダー内に表示する子要素
 * @returns カードヘッダーのJSX
 */
export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn('mb-4', className)} {...props} />
);
CardHeader.displayName = 'CardHeader';
