import { FC } from "react";
import { Pie } from "recharts";
import { PieData, PIE_COMMON_PROPS } from "../types";
import CustomLabel from "../CustomLabel";

interface Props {
  data: PieData[];
  innerRadius: number;
  outerRadius: number;
  renderCell: (entry: PieData) => JSX.Element;
}

const BasePie: FC<Props> = ({ data, innerRadius, outerRadius, renderCell }) => (
  <Pie
    {...PIE_COMMON_PROPS}
    data={data}
    innerRadius={innerRadius}
    outerRadius={outerRadius}
    label={CustomLabel}
  >
    {data.map(renderCell)}
  </Pie>
);

export default BasePie;
