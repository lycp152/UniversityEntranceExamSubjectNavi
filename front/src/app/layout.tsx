import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import { ReactNode } from "react";
import Header from "@/components/layouts/header/header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "受験科目navi",
  description: "大学受験の科目別配点割合をグラフ化・検索できるサイト",
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="ja">
      <body suppressHydrationWarning className={inter.className}>
        <Header />
        {children}
      </body>
    </html>
  );
}
