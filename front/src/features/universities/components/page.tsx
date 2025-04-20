/**
 * 大学の詳細ページを表示するコンポーネント
 * 大学の科目情報、スコア表示、科目別配点テーブルを統合して表示
 *
 * @param {Object} props - コンポーネントのプロパティ
 * @param {Promise<UniversityPageParams>} props.params - ページのパラメータ
 * @returns {JSX.Element} 大学の詳細ページコンポーネント
 */
'use client';

import { use } from 'react';
import { notFound } from 'next/navigation';
import { ErrorMessage } from '@/components/errors/error-message';
import { LoadingSpinner } from '@/components/ui/feedback/spinner';
import { useUniversityData } from '@/features/universities/hooks/use-university-data';
import UniversityLayout from '@/features/universities/components/university-layout';
import { UniversityPageParams } from '@/features/universities/types/params';

interface Props {
  params: Promise<UniversityPageParams>;
}

const UniversityPage = ({ params }: Props) => {
  // パラメータを解決
  const resolvedParams = use(params);
  // 大学データを取得
  const { selectedSubject, loading, error } = useUniversityData(resolvedParams);

  // ローディング中はスピナーを表示
  if (loading) {
    return <LoadingSpinner />;
  }

  // エラーが発生した場合はエラーメッセージを表示
  if (error) {
    return <ErrorMessage message={error} />;
  }

  // 科目が見つからない場合は404ページを表示
  if (!selectedSubject) {
    notFound();
    return null;
  }

  // 大学の詳細情報を表示
  return <UniversityLayout subject={selectedSubject} />;
};

export default UniversityPage;
