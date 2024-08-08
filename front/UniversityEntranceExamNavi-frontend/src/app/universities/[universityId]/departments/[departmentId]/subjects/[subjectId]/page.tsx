"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { subjects } from "../../../../../../components/SubjectData";

const SubjectDetailPage = ({
  params,
}: {
  params: { universityId: string; departmentId: string; subjectId: string };
}) => {
  useRouter();
  const { universityId, departmentId, subjectId } = params;

  const [subjectDetail, setSubjectDetail] = useState<{
    universityName: string | null;
    department: string | null;
    major: string | null;
    schedule: string | null;
    enrollment: number | null;
  }>({
    universityName: null,
    department: null,
    major: null,
    schedule: null,
    enrollment: null,
  });

  useEffect(() => {
    // ID に基づいてデータを取得する
    const subject = subjects.find(
      (subject) =>
        subject.universityId === parseInt(universityId) &&
        subject.departmentId === parseInt(departmentId) &&
        subject.subjectId === parseInt(subjectId)
    );

    if (subject) {
      setSubjectDetail({
        universityName: subject.universityName,
        department: subject.department,
        major: subject.major,
        schedule: subject.schedule,
        enrollment: subject.enrollment,
      });
    } else {
      setSubjectDetail({
        universityName: "大学名が見つかりません",
        department: null,
        major: null,
        schedule: null,
        enrollment: null,
      });
    }
  }, [universityId, departmentId, subjectId]);

  return (
    <div className="bg-white shadow p-4">
      <h1 className="text-xl font-bold mb-4">
        {subjectDetail.universityName ?? "読み込み中..."}
      </h1>
      <p className="mb-2">
        <strong>学部・募集枠:</strong> {subjectDetail.department ?? "情報なし"}
      </p>
      <p className="mb-2">
        <strong>学科・専攻・募集枠:</strong> {subjectDetail.major ?? "情報なし"}
      </p>
      <p className="mb-2">
        <strong>日程:</strong> {subjectDetail.schedule ?? "情報なし"}期
      </p>
      <p className="mb-2">
        <strong>募集人員:</strong> {subjectDetail.enrollment ?? "情報なし"} 名
      </p>
    </div>
  );
};

export default SubjectDetailPage;
