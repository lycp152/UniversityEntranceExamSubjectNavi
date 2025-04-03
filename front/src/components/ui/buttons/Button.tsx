/**
 * ボタンコンポーネント
 *
 * @module button
 * @description
 * アプリケーション全体で使用される基本的なボタンコンポーネントです。
 * Tailwind CSSとclass-variance-authorityを使用して、バリアントとサイズの管理を行います。
 *
 * @features
 * - アクセシビリティ対応（キーボード操作、フォーカス状態）
 * - レスポンシブデザイン
 * - カスタマイズ可能なバリアントとサイズ
 * - 無効状態のスタイリング
 */
import { ButtonHTMLAttributes, forwardRef } from 'react';
import { VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/styles/style-utils';
import { buttonVariants } from './button-variants';

/**
 * ボタンコンポーネントのProps型定義
 *
 * @extends ButtonHTMLAttributes<HTMLButtonElement> - 標準的なHTMLボタン属性
 * @extends VariantProps<typeof buttonVariants> - バリアントとサイズの型定義
 */
export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

/**
 * ボタンコンポーネント
 *
 * @param className - 追加のスタイルクラス
 * @param variant - ボタンのバリアント（default/outline）
 * @param size - ボタンのサイズ（default/icon）
 * @param ref - フォワードされたref
 * @param props - その他のHTMLボタン属性
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  }
);

Button.displayName = 'Button';

export { Button };
