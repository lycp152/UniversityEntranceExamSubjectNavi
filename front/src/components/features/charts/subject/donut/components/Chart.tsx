import { FC } from "react";
import { PieChart as RechartsPieChart } from "recharts";
import Patterns from "@/components/features/charts/subject/donut/patterns";
import InnerPie from "./InnerPie";
import OuterPie from "./OuterPie";
import CustomTooltip from "";
import { ChartData } from "";

interface Props {
  data: ChartData;
}

const Chart: FC<Props> = ({ data: { detailedData, outerData } }) => (
  <RechartsPieChart>
    <Patterns />
    <InnerPie data={detailedData} />
    <OuterPie data={outerData} />
    <CustomTooltip />
  </RechartsPieChart>
);

export default Chart;
