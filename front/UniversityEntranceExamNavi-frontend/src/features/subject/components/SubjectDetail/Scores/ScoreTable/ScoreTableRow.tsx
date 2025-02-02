import { FC } from "react";
import { Subject } from "../../SearchResultTable/SubjectData";

interface Props {
  label: string;
  keyName: "commonTest" | "secondTest";
  scores: Subject["subjects"];
}

const ScoreTableRow: FC<Props> = ({ label, keyName, scores }) => (
  <tr>
    <td className="border border-gray-300 p-2 whitespace-nowrap">{label}</td>
    {Object.entries(scores).map(([subjectName, score]) => (
      <td
        key={subjectName}
        className="border border-gray-300 p-2 text-right"
      >
        {score[keyName]}
      </td>
    ))}
  </tr>
);

export default ScoreTableRow;
