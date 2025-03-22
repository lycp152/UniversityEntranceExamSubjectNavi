import { memo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/cards/card";
import type { University } from "@/types/university/university";

interface UniversityInfoCardProps {
  university: University;
}

export const UniversityInfoCard = memo<UniversityInfoCardProps>(
  ({ university }) => {
    return (
      <Card>
        <CardHeader>
          <CardTitle>大学情報: {university.name || "名称未設定"}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm">学部数: {university.departments.length}</p>
          </div>
        </CardContent>
      </Card>
    );
  }
);

UniversityInfoCard.displayName = "UniversityInfoCard";
