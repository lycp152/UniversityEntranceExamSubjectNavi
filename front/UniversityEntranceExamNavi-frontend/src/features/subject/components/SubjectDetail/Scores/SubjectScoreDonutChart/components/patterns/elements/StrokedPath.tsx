import { FC } from "react";
import { PATTERN_STYLES } from "../constants/styles";
import { SVGElementProps } from "./types";

type Props = Pick<SVGElementProps, "d" | "fill">;

const StrokedPath: FC<Props> = ({ d, fill = "none" }) => (
  <path
    d={d}
    stroke={PATTERN_STYLES.stroke.color}
    strokeWidth={PATTERN_STYLES.stroke.width}
    strokeOpacity={PATTERN_STYLES.stroke.opacity}
    fill={fill}
  />
);

export default StrokedPath;
