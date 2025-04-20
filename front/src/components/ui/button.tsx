/**
 * @fileoverview カスタマイズ可能なボタンコンポーネント
 *
 * @example
 * ```tsx
 * // デフォルトボタン
 * <Button>クリック</Button>
 *
 * // バリアントとサイズを指定
 * <Button variant="destructive" size="lg">削除</Button>
 *
 * // カスタムクラスを追加
 * <Button className="my-custom-class">カスタム</Button>
 * ```
 *
 * @accessibility
 * - WAI-ARIAガイドラインに準拠
 * - キーボードナビゲーション対応（Tab、Space、Enter）
 * - 高コントラスト比を確保
 * - フォーカス可視性の保証
 * - スクリーンリーダー対応
 */

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/styles/tailwind-utils';

/**
 * ボタンのスタイルバリエーション定義
 * @constant
 * @description
 * class-variance-authorityを使用して、
 * ボタンの見た目のバリエーションを定義します。
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow-xs hover:bg-primary/90',
        destructive:
          'bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        outline:
          'border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50',
        secondary: 'bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
        lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
        icon: 'size-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

/**
 * ボタンコンポーネントのプロパティ型定義
 * @typedef ButtonProps
 * @property {string} [className] - カスタムクラス名
 * @property {VariantProps<typeof buttonVariants>['variant']} [variant] - ボタンのバリアント
 * @property {VariantProps<typeof buttonVariants>['size']} [size] - ボタンのサイズ
 * @property {boolean} [asChild=false] - 子要素としてレンダリングするかどうか
 */

/**
 * ボタンコンポーネント実装
 * @param {ButtonProps} props - コンポーネントのプロパティ
 * @returns {JSX.Element} レンダリングされたボタン要素
 */
function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
