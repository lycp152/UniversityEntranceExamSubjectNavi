import React from "react";
import { subjects, titleData } from "./SubjectData";

const SubjectTable: React.FC = () => {
  // タイトルの生成
  const title = `${titleData.testType} の ${titleData.subject} の配点比率が${titleData.attribute}大学(${titleData.schedule}期)`;

  return (
    <div className="bg-white shadow p-4">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b text-left">順位</th>
            <th className="py-2 px-4 border-b text-left">比率（%）</th>
            <th className="py-2 px-4 border-b text-left">大学名</th>
            <th className="py-2 px-4 border-b text-left">学部・募集枠</th>
            <th className="py-2 px-4 border-b text-left">学科・専攻・募集枠</th>
            <th className="py-2 px-4 border-b text-left">日程</th>
            <th className="py-2 px-4 border-b text-left">募集人員</th>
          </tr>
        </thead>
        <tbody>
          {subjects.map((subject) => (
            <tr key={subject.id}>
              <td className="py-2 px-4 border-b">{subject.rank}</td>
              <td className="py-2 px-4 border-b">{subject.subjectRatio} %</td>
              <td className="py-2 px-4 border-b">{subject.universityName}</td>
              <td className="py-2 px-4 border-b">{subject.department}</td>
              <td className="py-2 px-4 border-b">{subject.major}</td>
              <td className="py-2 px-4 border-b">{subject.schedule}</td>
              <td className="py-2 px-4 border-b">{subject.enrollment} 名</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SubjectTable;
