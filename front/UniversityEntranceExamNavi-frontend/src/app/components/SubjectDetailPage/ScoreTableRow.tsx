import React from "react";

interface ScoreTableRowProps {
  label: string;
  keyName: string;
  scores: Record<string, any>;
  isPercentage?: boolean;
}

const ScoreTableRow: React.FC<ScoreTableRowProps> = ({
  label,
  keyName,
  scores,
  isPercentage = false,
}) => (
  <tr>
    <td
      className={`border border-gray-300 p-2 ${
        label === "配点合計に占める割合" ? "pl-8" : ""
      }`}
    >
      {label}
    </td>
    {Object.keys(scores).map((subjectName) => (
      <td key={subjectName} className="border border-gray-300 p-2 text-center">
        {isPercentage
          ? `${(scores[subjectName][keyName] as number).toFixed(2)} %`
          : scores[subjectName][keyName]}
      </td>
    ))}
  </tr>
);

export default ScoreTableRow;
