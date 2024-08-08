const ScoreTableRow = ({
  label,
  keyName,
  scores,
  isPercentage = false,
}: {
  label: string;
  keyName: keyof (typeof scores)[string];
  scores: Record<string, any>;
  isPercentage?: boolean;
}) => (
  <tr>
    <td className="border border-gray-300 p-2">{label}</td>
    {Object.keys(scores).map((subjectName) => (
      <td key={subjectName} className="border border-gray-300 p-2">
        {isPercentage
          ? `${scores[subjectName][keyName]}%`
          : scores[subjectName][keyName]}
      </td>
    ))}
  </tr>
);

export default ScoreTableRow;
