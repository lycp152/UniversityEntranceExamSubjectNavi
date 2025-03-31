import { FC } from "react";
import { Pie, Cell } from "recharts";
import CustomLabel from "./CustomLabel";
import { PIE_COMMON_PROPS } from "@/features/charts/types";
import { PieData } from "@/types/charts/pie-chart";

interface Props {
  data: PieData[];
}

const OuterPie: FC<Props> = ({ data }) => (
  <Pie
    {...PIE_COMMON_PROPS}
    data={data}
    innerRadius={170}
    outerRadius={220}
    label={CustomLabel}
  >
    {data.map((entry) => (
      <Cell key={`cell-${entry.name}`} fill={`url(#pattern-${entry.name})`} />
    ))}
  </Pie>
);

export default OuterPie;
