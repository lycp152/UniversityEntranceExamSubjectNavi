import { useUniversity } from '@/hooks/api/useUniversities';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card/Card';
import { Button } from '@/components/ui/button/Button';
import Link from 'next/link';

const UniversityDetailSkeleton = () => (
  <div className="space-y-6" aria-label="大学詳細情報読み込み中">
    <Card className="animate-pulse">
      <div className="flex flex-col space-y-1.5 p-6">
        <div className="relative">
          <div className="h-8 w-3/4 bg-gray-200 rounded" aria-hidden="true"></div>
          <h2 className="sr-only">大学情報を読み込み中</h2>
        </div>
      </div>
      <CardContent>
        <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
      </CardContent>
    </Card>

    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {['a', 'b', 'c'].map((id) => (
        <Card key={`department-skeleton-${id}`} className="animate-pulse">
          <div className="flex flex-col space-y-1.5 p-6">
            <div className="relative">
              <div className="h-6 w-3/4 bg-gray-200 rounded" aria-hidden="true"></div>
              <h3 className="sr-only">学部情報を読み込み中</h3>
            </div>
            <div className="h-4 w-full bg-gray-200 rounded mt-2"></div>
          </div>
          <CardContent>
            <div className="space-y-2">
              <div className="h-4 w-1/4 bg-gray-200 rounded"></div>
              <div className="h-10 w-24 bg-gray-200 rounded"></div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

interface UniversityDetailProps {
  id: number;
}

export const UniversityDetail = ({ id }: UniversityDetailProps) => {
  const { data: university, isLoading, error } = useUniversity(id);

  if (isLoading) {
    return <UniversityDetailSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center p-4">
        <h2 className="text-xl font-bold text-red-600 mb-2">エラーが発生しました</h2>
        <p className="text-gray-600">
          大学情報の取得に失敗しました。時間をおいて再度お試しください。
        </p>
        <div className="space-x-4 mt-4">
          <Button onClick={() => window.location.reload()}>再読み込み</Button>
          <Link href={{ pathname: '/' }}>
            <Button variant="outline">トップに戻る</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!university) {
    return (
      <div className="text-center p-4">
        <h2 className="text-xl font-bold text-gray-600 mb-2">大学が見つかりません</h2>
        <p className="text-gray-600">
          指定された大学の情報は存在しないか、削除された可能性があります。
        </p>
        <Link href={{ pathname: '/' }}>
          <Button variant="outline" className="mt-4">
            トップに戻る
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>大学情報: {university.name || '名称未設定'}</CardTitle>
          <CardDescription>{university.description || '説明なし'}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm">
              Webサイト:{' '}
              <a
                href={university.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                {university.website}
              </a>
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {university.departments.map((department) => (
          <Card key={department.id}>
            <CardHeader>
              <CardTitle>学部情報: {department.name || '名称未設定'}</CardTitle>
              <CardDescription>{department.description || '説明なし'}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm">学科数: {department.majors.length}</p>
                <Link href={{ pathname: `/departments/${department.id}` }}>
                  <Button>学部詳細を見る</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-4">
        <Link href={{ pathname: '/' }}>
          <Button variant="outline">戻る</Button>
        </Link>
      </div>
    </div>
  );
};
