import { useUniversities } from '@/lib/hooks/university/useUniversities';
import { UniversityListSkeleton } from './UniversityListSkeleton';
import { ErrorState } from '../detail/ErrorState';
import { UniversityCard } from './UniversityCard';
import { UniversityErrorBoundary } from '../error/ErrorBoundary';

const UniversityListContent = () => {
  const { data: universities, isLoading, error } = useUniversities();

  if (isLoading) {
    return <UniversityListSkeleton />;
  }

  if (error) {
    return (
      <ErrorState
        title="エラーが発生しました"
        message="データの取得に失敗しました。時間をおいて再度お試しください。"
        showReload
      />
    );
  }

  if (!universities?.length) {
    return (
      <ErrorState title="大学が見つかりません" message="現在、表示できる大学情報がありません。" />
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {universities.map((university) => (
        <UniversityCard key={university.id} university={university} />
      ))}
    </div>
  );
};

export const UniversityList = () => {
  return (
    <UniversityErrorBoundary>
      <UniversityListContent />
    </UniversityErrorBoundary>
  );
};
