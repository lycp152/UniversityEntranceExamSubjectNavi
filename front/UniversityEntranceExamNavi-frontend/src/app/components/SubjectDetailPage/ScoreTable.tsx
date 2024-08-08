import ScoreTableRow from "./ScoreTableRow";
import { Subject } from "../SubjectTable/SubjectData";

const ScoreTable = ({
  subjectScores,
}: {
  subjectScores: Record<string, Subject["subjectScores"][string]>;
}) => (
  <div className="mt-4">
    <h2 className="text-lg font-semibold mb-2">科目別配点と割合</h2>
    <table className="min-w-full border-collapse border border-gray-300">
      <thead>
        <tr>
          <th className="border border-gray-300 p-2">項目</th>
          {Object.keys(subjectScores).map((subjectName) => (
            <th key={subjectName} className="border border-gray-300 p-2">
              {subjectName}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        <ScoreTableRow
          label="共通テスト 配点"
          keyName="commonTestScore"
          scores={subjectScores}
        />
        <ScoreTableRow
          label="共通テスト 割合"
          keyName="commonTestRatio"
          scores={subjectScores}
          isPercentage
        />
        <ScoreTableRow
          label="二次試験 配点"
          keyName="secondTestScore"
          scores={subjectScores}
        />
        <ScoreTableRow
          label="二次試験 割合"
          keyName="secondTestRatio"
          scores={subjectScores}
          isPercentage
        />
        <ScoreTableRow
          label="共通テスト+二次試験 配点"
          keyName="totalScore"
          scores={subjectScores}
        />
        <ScoreTableRow
          label="共通テスト+二次試験 割合"
          keyName="totalRatio"
          scores={subjectScores}
          isPercentage
        />
      </tbody>
    </table>
  </div>
);

export default ScoreTable;
