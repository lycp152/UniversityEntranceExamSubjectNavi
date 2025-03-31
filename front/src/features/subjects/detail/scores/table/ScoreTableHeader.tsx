import { FC, memo } from "react";
import { TEST_TYPES } from "@/types/score";

const TEST_TYPE_LABELS = {
  [TEST_TYPES.COMMON]: "共通テスト",
  [TEST_TYPES.SECONDARY]: "個別試験",
} as const;

const ScoreTableHeader: FC = memo(() => (
  <thead className="bg-gray-50">
    <tr>
      <th
        scope="col"
        className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
      >
        科目名
      </th>
      {Object.entries(TEST_TYPE_LABELS).map(([type, label]) => (
        <th
          key={type}
          scope="col"
          className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900"
        >
          {label} <span className="sr-only">の点数と割合</span>
        </th>
      ))}
      <th
        scope="col"
        className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900"
      >
        合計 <span className="sr-only">点数と割合</span>
      </th>
    </tr>
  </thead>
));

ScoreTableHeader.displayName = "ScoreTableHeader";

export default ScoreTableHeader;
