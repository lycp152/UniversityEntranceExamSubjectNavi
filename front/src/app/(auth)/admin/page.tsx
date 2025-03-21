import { Metadata } from "next";
import { Suspense } from "react";
import { AdminPage } from "@/features/admin/components/AdminPage";
import { LoadingSpinner } from "@/components/ui/feedback/LoadingSpinner";

export const metadata: Metadata = {
  title: "管理ページ | 大学入試科目ナビ",
  description:
    "大学入試科目ナビの管理ページです。大学・学部の情報を管理できます。",
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page(): JSX.Element {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <AdminPage />
    </Suspense>
  );
}
