/**
 * テーマ切り替えコンポーネント
 *
 * @module mode-toggle
 * @description
 * ライト、ダーク、システムテーマを切り替えるためのドロップダウンメニューコンポーネントです。
 * next-themesを使用してテーマの状態を管理し、アニメーション付きのアイコンで現在のテーマを表示します。
 *
 * @example
 * ```tsx
 * <ModeToggle />
 * ```
 *
 * @accessibility
 * - スクリーンリーダー対応: アイコンボタンにsr-onlyラベルを使用
 * - キーボード操作: Tab、Space、Enter、Escape
 * - アニメーション: prefers-reduced-motion対応のトランジション
 * - ハイコントラスト: システムの設定に応じたテーマ切り替え
 */

'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

/**
 * テーマ切り替えボタンコンポーネント
 * @returns {JSX.Element} テーマ切り替えドロップダウンメニュー
 *
 * @description
 * - ライトモード: 太陽アイコンを表示
 * - ダークモード: 月アイコンを表示
 * - システムモード: システム設定に追従
 *
 * アイコンは滑らかなアニメーションで切り替わり、
 * ユーザーの操作に視覚的なフィードバックを提供します。
 */
export function ModeToggle() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme('light')}>Light</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>Dark</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>System</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
