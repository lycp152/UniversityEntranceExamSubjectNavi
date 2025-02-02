import { FC } from "react";
import { Subject } from "../../SearchResultTable/SubjectData";

const ScoreTableHeader: FC<{ scores: Subject["subjects"] }> = ({ scores }) => (
  <thead>
    <tr>
      <th className="border border-gray-300 p-2 whitespace-nowrap">項目</th>
      {Object.keys(scores).map((subjectName) => (
        <th
          key={subjectName}
          className="border border-gray-300 p-2 whitespace-nowrap"
        >
          {subjectName}
        </th>
      ))}
    </tr>
  </thead>
);

export default ScoreTableHeader;
