/**
 * ボタンのバリアントとサイズの定義
 *
 * @module button-variants
 * @description
 * ボタンコンポーネントで使用されるバリアントとサイズの定義を管理します。
 * class-variance-authorityを使用して、型安全なスタイル定義を提供します。
 */
import { cva } from 'class-variance-authority';

/**
 * ボタンのバリアントとサイズを定義
 *
 * @variants
 * - default: プライマリカラーの背景を持つボタン
 * - outline: アウトラインスタイルのボタン
 *
 * @sizes
 * - default: 標準サイズ（高さ40px、パディング16px）
 * - icon: アイコンボタン用の正方形サイズ（40x40px）
 */
export const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
      },
      size: {
        default: 'h-10 py-2 px-4',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);
