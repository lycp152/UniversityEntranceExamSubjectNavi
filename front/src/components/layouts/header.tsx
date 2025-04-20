/**
 * ヘッダーコンポーネント
 *
 * @module header
 * @description
 * アプリケーションのヘッダー部分を表示するコンポーネントです。
 * Next.jsのLinkコンポーネントとTailwind CSSを使用して実装されています。
 *
 * @features
 * - ロゴ表示
 * - ナビゲーション
 * - ログイン/新規登録ボタン
 */
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/ui/mode-toggle';

export default function Header() {
  const pathname = usePathname();
  const isHome = pathname === '/';

  return (
    <header
      role="banner"
      className="sticky top-0 z-50 w-full bg-accent shadow-sm"
      aria-label="サイトヘッダー"
    >
      <nav className="w-full" role="navigation" aria-label="メインナビゲーション">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3">
          <Link
            href="/"
            className={`flex items-center space-x-2 transition-opacity duration-200 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg ${
              isHome ? 'pointer-events-none' : ''
            }`}
            aria-label="ホームへ戻る"
            prefetch={!isHome}
          >
            <h1 className="text-xl sm:text-2xl font-bold">受験科目navi</h1>
          </Link>
          <div className="flex items-center gap-4">
            <Button asChild variant="default">
              <Link href="/login" aria-label="ログインまたは新規登録" prefetch>
                ログイン・新規登録
              </Link>
            </Button>
            <ModeToggle />
          </div>
        </div>
      </nav>
    </header>
  );
}
