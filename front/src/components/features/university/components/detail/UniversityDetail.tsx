import Link from "next/link";
import { Button } from "@/components/ui/Button/page";
import { useUniversity } from "@/lib/hooks/university/useUniversities";
import { UniversityDetailSkeleton } from "./UniversityDetailSkeleton";
import { ErrorState } from "./ErrorState";
import { UniversityInfoCard } from "./UniversityInfoCard";
import { DepartmentCard } from "./DepartmentCard";
import { UniversityErrorBoundary } from "../error/ErrorBoundary";

interface UniversityDetailProps {
  id: number;
}

const UniversityDetailContent = ({ id }: UniversityDetailProps) => {
  const { data: university, isLoading, error } = useUniversity(id);

  if (isLoading) {
    return <UniversityDetailSkeleton />;
  }

  if (error) {
    return (
      <ErrorState
        title="エラーが発生しました"
        message="大学情報の取得に失敗しました。時間をおいて再度お試しください。"
        showReload
      />
    );
  }

  if (!university) {
    return (
      <ErrorState
        title="大学が見つかりません"
        message="指定された大学の情報は存在しないか、削除された可能性があります。"
      />
    );
  }

  return (
    <div className="space-y-6">
      <UniversityInfoCard university={university} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {university.departments.map((department) => (
          <DepartmentCard key={department.id} department={department} />
        ))}
      </div>

      <div className="mt-4">
        <Link href={{ pathname: "/" }}>
          <Button variant="outline">戻る</Button>
        </Link>
      </div>
    </div>
  );
};

export const UniversityDetail = (props: UniversityDetailProps) => {
  return (
    <UniversityErrorBoundary>
      <UniversityDetailContent {...props} />
    </UniversityErrorBoundary>
  );
};
