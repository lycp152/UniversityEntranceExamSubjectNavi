"use client";

import { useRouter } from "next/navigation";
import { subjects, titleData } from "./SearchResultTable/SubjectData";

const ResultTable: React.FC = () => {
  useRouter();

  // タイトルの生成
  const title = `${titleData.testType} の ${titleData.subject} の配点比率が${titleData.attribute}大学(${titleData.schedule}期)`;

  // 行クリック時のハンドラ
  const handleRowClick = (
    universityId: number,
    departmentId: number,
    subjectId: number
  ) => {
    const url = `/universities/${universityId}/departments/${departmentId}/subjects/${subjectId}`;
    window.open(url, "_blank");
  };

  return (
    <div className="bg-white shadow p-4">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b text-left whitespace-nowrap">
                順位
              </th>
              <th className="py-2 px-4 border-b text-left whitespace-nowrap">
                比率（%）
              </th>
              <th className="py-2 px-4 border-b text-left whitespace-nowrap">
                大学名
              </th>
              <th className="py-2 px-4 border-b text-left whitespace-nowrap">
                学部・募集枠
              </th>
              <th className="py-2 px-4 border-b text-left whitespace-nowrap">
                学科・専攻・募集枠
              </th>
              <th className="py-2 px-4 border-b text-left whitespace-nowrap">
                日程
              </th>
              <th className="py-2 px-4 border-b text-left whitespace-nowrap">
                募集人員
              </th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((subject) => (
              <tr
                key={subject.subjectId}
                className="cursor-pointer hover:bg-gray-100"
                onClick={() =>
                  handleRowClick(
                    subject.universityId,
                    subject.departmentId,
                    subject.subjectId
                  )
                }
              >
                <td className="py-2 px-4 border-b whitespace-nowrap">
                  {subject.rank}
                </td>
                <td className="py-2 px-4 border-b whitespace-nowrap">
                  {subject.subjectRatio} %
                </td>
                <td className="py-2 px-4 border-b whitespace-nowrap">
                  {subject.universityName}
                </td>
                <td className="py-2 px-4 border-b whitespace-nowrap">
                  {subject.department}
                </td>
                <td className="py-2 px-4 border-b whitespace-nowrap">
                  {subject.major}
                </td>
                <td className="py-2 px-4 border-b whitespace-nowrap">
                  {subject.schedule}
                </td>
                <td className="py-2 px-4 border-b whitespace-nowrap">
                  {subject.enrollment} 名
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResultTable;
