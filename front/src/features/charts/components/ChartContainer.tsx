import { FC, ReactElement } from "react";
import { ResponsiveContainer } from "recharts";
import {
  containerStyles,
  containerClassName,
  chartStyles,
} from "@/styles/chart-styles";

interface Props {
  children: ReactElement;
}

const ChartContainer: FC<Props> = ({ children }) => (
  <div className={containerClassName} style={containerStyles}>
    <style>{chartStyles}</style>
    <ResponsiveContainer width="100%" height="100%">
      {children}
    </ResponsiveContainer>
  </div>
);

export default ChartContainer;
