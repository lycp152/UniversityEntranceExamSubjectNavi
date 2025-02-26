import { Card, CardContent } from "@/components/ui/Card/page";

export const UniversityListSkeleton = () => (
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
