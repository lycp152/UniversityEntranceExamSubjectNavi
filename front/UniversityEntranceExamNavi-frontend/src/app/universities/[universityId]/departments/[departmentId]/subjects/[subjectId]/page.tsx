"use client";

import { useRouter } from "next/navigation";

const SubjectDetailPage = ({
  params,
}: {
  params: { universityId: string; departmentId: string; subjectId: string };
}) => {
  const router = useRouter();
  const { universityId, departmentId, subjectId } = params;

  // データ取得やその他のロジックをここに追加
  // 例えば、APIから詳細データを取得する

  return (
    <div className="bg-white shadow p-4">
      <h1 className="text-xl font-bold mb-4">ここに詳細を表示</h1>
      <p>University ID: {universityId}</p>
      <p>Department ID: {departmentId}</p>
      <p>Subject ID: {subjectId}</p>
      {/* 詳細内容をここに表示 */}
    </div>
  );
};

export default SubjectDetailPage;
