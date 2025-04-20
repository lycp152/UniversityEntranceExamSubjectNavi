/**
 * ルートレイアウトコンポーネント
 *
 * アプリケーション全体の共通レイアウトを定義します。
 * - メタデータの設定
 * - フォントの設定
 * - ヘッダーの配置
 * - 共通スタイルの適用
 */
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import { ReactNode } from 'react';
import Header from '@/components/layouts/header';
import { ThemeProvider } from '@/components/theme-provider';
// Interフォントの設定
const inter = Inter({ subsets: ['latin'] });

// ベースURLの設定（環境変数から取得、未設定の場合はローカルホストを使用）
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';

// メタデータの設定
export const metadata: Metadata = {
  title: {
    default: '大学入試科目ナビ',
    template: '%s | 大学入試科目ナビ',
  },
  description: '大学受験の科目別配点割合をグラフ化・検索できるサイト',
  keywords: ['大学入試', '受験科目', '配点', '大学受験', '入試情報', '科目検索'],
  authors: [{ name: '大学入試科目ナビ' }],
  creator: '大学入試科目ナビ',
  publisher: '大学入試科目ナビ',
  formatDetection: {
    email: true,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: baseUrl,
    siteName: '大学入試科目ナビ',
    title: '大学入試科目ナビ',
    description: '大学受験の科目別配点割合をグラフ化・検索できるサイト',
  },
  twitter: {
    card: 'summary_large_image',
    title: '大学入試科目ナビ',
    description: '大学受験の科目別配点割合をグラフ化・検索できるサイト',
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body suppressHydrationWarning className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
