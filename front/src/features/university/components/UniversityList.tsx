import { useUniversities } from "@/hooks/university/useUniversities";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/cards/Card";
import { Button } from "@/components/ui/buttons/Button";
import Link from "next/link";

const UniversityListSkeleton = () => (
  <div
    className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
    aria-label="大学情報読み込み中"
  >
    {["a", "b", "c", "d", "e", "f"].map((id) => (
      <Card
        key={`university-skeleton-${id}`}
        className="animate-pulse"
        aria-hidden="true"
      >
        <div className="flex flex-col space-y-1.5 p-6">
          <div className="h-6 w-3/4 bg-gray-200 rounded"></div>
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
);

export const UniversityList = () => {
  const { data: universities, isLoading, error } = useUniversities();

  if (isLoading) {
    return <UniversityListSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center p-4">
        <h2 className="text-xl font-bold text-red-600 mb-2">
          エラーが発生しました
        </h2>
        <p className="text-gray-600">
          データの取得に失敗しました。時間をおいて再度お試しください。
        </p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          再読み込み
        </Button>
      </div>
    );
  }

  if (!universities?.length) {
    return (
      <div className="text-center p-4">
        <h2 className="text-xl font-bold text-gray-600 mb-2">
          大学が見つかりません
        </h2>
        <p className="text-gray-600">現在、表示できる大学情報がありません。</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {universities.map((university) => (
        <Card key={university.id}>
          <CardHeader>
            <CardTitle>大学情報: {university.name || "名称未設定"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm">学部数: {university.departments.length}</p>
              <Link href={{ pathname: `/universities/${university.id}` }}>
                <Button>詳細を見る</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
