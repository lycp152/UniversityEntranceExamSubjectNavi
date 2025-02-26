import { memo } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card/page";
import { Button } from "@/components/ui/Button/page";
import type { University } from "@/lib/types/university/university";

interface UniversityCardProps {
  university: University;
}

export const UniversityCard = memo<UniversityCardProps>(({ university }) => {
  return (
    <article>
      <Card aria-labelledby={`university-title-${university.id}`}>
        <CardHeader>
          <CardTitle id={`university-title-${university.id}`}>
            大学情報: {university.name || "名称未設定"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p
              className="text-sm"
              aria-label={`学部数: ${university.departments.length}学部`}
            >
              学部数: {university.departments.length}
            </p>
            <Link
              href={{ pathname: `/universities/${university.id}` }}
              aria-label={`${university.name || "名称未設定"}の詳細を見る`}
            >
              <Button>詳細を見る</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </article>
  );
});

UniversityCard.displayName = "UniversityCard";
