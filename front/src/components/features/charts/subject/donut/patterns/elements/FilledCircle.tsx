import { FC } from "react";
import { PATTERN_STYLES } from "../constants/styles";
import { SVGElementProps } from "./types";

type Props = Pick<SVGElementProps, "cx" | "cy" | "r">;

const FilledCircle: FC<Props> = ({ cx, cy, r }) => (
  <circle
    cx={cx}
    cy={cy}
    r={r}
    fill={PATTERN_STYLES.fill.color}
    fillOpacity={PATTERN_STYLES.fill.opacity}
  />
);

export default FilledCircle;
