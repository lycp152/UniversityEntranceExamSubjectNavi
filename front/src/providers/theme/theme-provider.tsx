/**
 * テーマプロバイダーコンポーネント
 *
 * @description
 * アプリケーション全体のテーマ管理を行うプロバイダーコンポーネントです。
 * next-themesを使用してダークモードやライトモードの切り替えを管理します。
 *
 * @example
 * ```tsx
 * import { ThemeProvider } from './theme-provider'
 *
 * export default function App({ children }) {
 *   return (
 *     <ThemeProvider
 *       attribute="class"
 *       defaultTheme="system"
 *       enableSystem
 *     >
 *       {children}
 *     </ThemeProvider>
 *   )
 * }
 * ```
 *
 * @see {@link https://github.com/pacocoursey/next-themes next-themes}
 */

'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

/**
 * テーマプロバイダーのプロパティ型定義
 * next-themesのThemeProviderと同じプロパティを受け取ります
 *
 * @typedef {Parameters<typeof NextThemesProvider>[0]} ThemeProviderProps
 */
type ThemeProviderProps = Parameters<typeof NextThemesProvider>[0];

/**
 * テーマプロバイダーコンポーネント
 *
 * @param {Readonly<ThemeProviderProps>} props - テーマプロバイダーのプロパティ
 * @param {React.ReactNode} props.children - 子要素
 * @returns {JSX.Element} テーマプロバイダーでラップされたコンポーネント
 */
export function ThemeProvider({ children, ...props }: Readonly<ThemeProviderProps>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
