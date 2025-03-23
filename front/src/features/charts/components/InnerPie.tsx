import { FC } from "react";
import { Pie, Cell } from "recharts";
import { COLORS } from "@/constants/subjects2";
import CustomLabel from "./CustomLabel";
import { DetailedPieData, PIE_COMMON_PROPS } from "../types";

interface Props {
  data: DetailedPieData[];
}

const InnerPie: FC<Props> = ({ data }) => (
  <Pie
    {...PIE_COMMON_PROPS}
    data={data}
    innerRadius={0}
    outerRadius={150}
    label={CustomLabel}
  >
    {data.map((entry) => (
      <Cell
        key={`cell-${entry.name}`}
        fill={
          entry.name.includes("共通")
            ? COLORS[entry.category]
            : `url(#pattern-${entry.category})`
        }
      />
    ))}
  </Pie>
);

export default InnerPie;
