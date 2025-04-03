/**
 * 入力フィールドコンポーネント
 *
 * このコンポーネントは、標準的なHTML input要素を拡張した再利用可能な入力フィールドを提供します。
 * アクセシビリティに配慮したスタイリングと、カスタマイズ可能なプロパティをサポートします。
 */
import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/utils/styles/style-utils';

/**
 * Inputコンポーネント
 *
 * @param className - 追加のCSSクラス名
 * @param type - 入力フィールドのタイプ（text, password, email等）
 * @param props - その他のHTML input要素のプロパティ
 * @param ref - 入力フィールドへの参照
 */
const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
