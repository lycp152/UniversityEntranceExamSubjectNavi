import { FC } from "react";
import { Tooltip } from "recharts";

const CustomTooltip: FC = () => (
  <Tooltip
    formatter={(value: number, name: string, entry: any) => [
      `${value}点${
        entry?.payload?.percentage
          ? ` (${entry.payload.percentage.toFixed(1)}%)`
          : ""
      }`,
      name,
    ]}
  />
);

export default CustomTooltip;
