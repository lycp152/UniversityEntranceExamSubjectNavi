import { Inter } from 'next/font/google';
import './globals.css';
import { ReactNode } from 'react';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: '受験科目navi',
  description: '大学受験の科目別配点割合をグラフ化・検索',
};

export default function RootLayout({ children }: { readonly children: ReactNode }) {
  return (
    <html lang="ja">
      <body suppressHydrationWarning className={inter.className}>
        {children}
      </body>
    </html>
  );
}
