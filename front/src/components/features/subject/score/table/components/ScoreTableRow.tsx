import { FC } from "react";
import type { SubjectScores } from "@/types/score";
import { TEST_TYPES } from "@/types/score";

interface ScoreTableRowProps {
  label: string;
  keyName: typeof TEST_TYPES.COMMON | typeof TEST_TYPES.INDIVIDUAL;
  scores: SubjectScores;
  isPercentage?: boolean;
}

const ScoreTableRow: FC<ScoreTableRowProps> = ({
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
    {Object.entries(scores).map(([subjectName, score]) => (
      <td key={subjectName} className="border border-gray-300 p-2 text-center">
        {isPercentage
          ? `${((score[keyName].value / score[keyName].maxValue) * 100).toFixed(
              2
            )} %`
          : score[keyName].value}
      </td>
    ))}
  </tr>
);

export default ScoreTableRow;
