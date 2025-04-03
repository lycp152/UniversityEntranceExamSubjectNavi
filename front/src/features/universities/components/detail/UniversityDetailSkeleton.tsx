import { Card, CardContent } from '@/components/ui/cards';

export const UniversityDetailSkeleton = () => (
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
      {['a', 'b', 'c'].map(id => (
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
