/**
 * ホームページコンポーネント
 *
 * アプリケーションのメインページを提供します。
 * - 検索フォームの表示
 * - 検索結果の表示
 * - レスポンシブなレイアウト
 */
import SearchForm from '@/features/search/components/form/search-form';
import SearchResultTable from '@/features/search/components/result/search-result-table';
import { generateMetadata } from '@/lib/metadata';

// ページのメタデータ設定
export const metadata = generateMetadata(
  'トップ',
  '大学入試の科目配点を検索し、グラフで視覚化できます。大学受験に必要な科目配点情報を簡単に検索できます。'
);

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100">
      <div className="container mx-auto p-4">
        <SearchForm />
        <SearchResultTable />
      </div>
    </main>
  );
}
