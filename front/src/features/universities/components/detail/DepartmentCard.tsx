import { memo } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/cards/card";
import { Button } from "@/components/ui/buttons/button";
import type { Department } from "@/types/universities/university";

interface DepartmentCardProps {
  department: Department;
}

export const DepartmentCard = memo<DepartmentCardProps>(({ department }) => {
  return (
    <article>
      <Card aria-labelledby={`department-title-${department.id}`}>
        <CardHeader>
          <CardTitle id={`department-title-${department.id}`}>
            学部情報: {department.name || "名称未設定"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p
              className="text-sm"
              aria-label={`学科数: ${department.majors.length}学科`}
            >
              学科数: {department.majors.length}
            </p>
            <Link
              href={{ pathname: `/departments/${department.id}` }}
              aria-label={`${department.name || "名称未設定"}の詳細を見る`}
            >
              <Button>学部詳細を見る</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </article>
  );
});

DepartmentCard.displayName = "DepartmentCard";
