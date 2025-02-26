import { FC } from "react";
import { PATTERN_STYLES } from "../constants/styles";
import { SVGElementProps } from "./types";

type Props = Pick<SVGElementProps, "x1" | "y1" | "x2" | "y2"> & {
  strokeWidth?: string;
};

const StrokedLine: FC<Props> = ({ x1, y1, x2, y2, strokeWidth = "1" }) => (
  <line
    x1={x1}
    y1={y1}
    x2={x2}
    y2={y2}
    stroke={PATTERN_STYLES.stroke.color}
    strokeWidth={strokeWidth}
    strokeOpacity={PATTERN_STYLES.stroke.opacity}
  />
);

export default StrokedLine;
