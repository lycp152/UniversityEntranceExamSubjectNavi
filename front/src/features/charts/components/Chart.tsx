import { FC } from "react";
import { PieChart } from "recharts";
import Patterns from "@/features/charts/patterns";
import InnerPie from "./InnerPie";
import OuterPie from "./OuterPie";
import CustomTooltip from "./CustomTooltip";
import { ChartData } from "../types/chart";

interface Props {
  data: ChartData;
}

const Chart: FC<Props> = ({ data: { detailedData = [], outerData = [] } }) => (
  <PieChart>
    <Patterns />
    <InnerPie data={detailedData} />
    <OuterPie data={outerData} />
    <CustomTooltip />
  </PieChart>
);

export default Chart;
