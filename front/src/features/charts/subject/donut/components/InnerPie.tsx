import { FC } from "react";
import { Pie, Cell } from "recharts";
import { COLORS } from "@/lib/constants/subject";
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
            ? COLORS[entry.category as keyof typeof COLORS]
            : `url(#pattern-${entry.category})`
        }
      />
    ))}
  </Pie>
);

export default InnerPie;
