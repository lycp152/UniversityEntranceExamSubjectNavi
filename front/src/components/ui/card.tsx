/**
 * カードコンポーネントライブラリ
 *
 * @module card
 * @description
 * 柔軟なカードレイアウトを提供するコンポーネント群です。
 * ヘッダー、フッター、コンテンツなどの要素を組み合わせて
 * カスタマイズ可能なカードUIを構築できます。
 *
 * @example
 * ```tsx
 * <Card>
 *   <CardHeader>
 *     <CardTitle>タイトル</CardTitle>
 *     <CardDescription>説明文</CardDescription>
 *   </CardHeader>
 *   <CardContent>
 *     コンテンツ
 *   </CardContent>
 *   <CardFooter>
 *     フッター
 *   </CardFooter>
 * </Card>
 * ```
 */

import * as React from 'react';

import { cn } from '@/styles/tailwind-utils';

/**
 * カードのメインコンテナコンポーネント
 * @param {React.ComponentProps<'div'>} props - divタグのプロパティ
 * @returns {JSX.Element} カードコンテナ要素
 */
function Card({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card"
      className={cn(
        'bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm',
        className
      )}
      {...props}
    />
  );
}

/**
 * カードヘッダーコンポーネント
 * @param {React.ComponentProps<'div'>} props - divタグのプロパティ
 * @returns {JSX.Element} カードヘッダー要素
 */
function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        '@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6',
        className
      )}
      {...props}
    />
  );
}

/**
 * カードタイトルコンポーネント
 * @param {React.ComponentProps<'div'>} props - divタグのプロパティ
 * @returns {JSX.Element} カードタイトル要素
 */
function CardTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-title"
      className={cn('leading-none font-semibold', className)}
      {...props}
    />
  );
}

/**
 * カード説明文コンポーネント
 * @param {React.ComponentProps<'div'>} props - divタグのプロパティ
 * @returns {JSX.Element} カード説明文要素
 */
function CardDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-description"
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  );
}

/**
 * カードアクションコンポーネント
 * @param {React.ComponentProps<'div'>} props - divタグのプロパティ
 * @returns {JSX.Element} カードアクション要素
 */
function CardAction({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-action"
      className={cn('col-start-2 row-span-2 row-start-1 self-start justify-self-end', className)}
      {...props}
    />
  );
}

/**
 * カードコンテンツコンポーネント
 * @param {React.ComponentProps<'div'>} props - divタグのプロパティ
 * @returns {JSX.Element} カードコンテンツ要素
 */
function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card-content" className={cn('px-6', className)} {...props} />;
}

/**
 * カードフッターコンポーネント
 * @param {React.ComponentProps<'div'>} props - divタグのプロパティ
 * @returns {JSX.Element} カードフッター要素
 */
function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-footer"
      className={cn('flex items-center px-6 [.border-t]:pt-6', className)}
      {...props}
    />
  );
}

export { Card, CardHeader, CardFooter, CardTitle, CardAction, CardDescription, CardContent };
