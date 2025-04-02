/**
 * 大学詳細ページコンポーネント
 *
 * 特定の大学・学部・学科の詳細情報を表示します。
 * - 動的ルーティングによる柔軟なURL構造
 * - メタデータの動的生成
 * - 詳細情報の表示
 */
import UniversityPage from '@/features/universities/components/UniversityPage';
import { UniversityPageParams } from '@/features/universities/types/params';
import { Metadata } from 'next';

interface PageProps {
  readonly params: Promise<UniversityPageParams>;
}

/**
 * ページのメタデータを動的に生成
 * URLパラメータに基づいて適切なタイトルと説明を設定
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { universityId, departmentId, majorId } = await params;

  return {
    title: `${universityId} ${departmentId} ${majorId}の配点`,
    description: `${universityId}の${departmentId}${majorId}の入試科目情報を確認できます。`,
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function Page({ params }: PageProps) {
  return <UniversityPage params={params} />;
}
