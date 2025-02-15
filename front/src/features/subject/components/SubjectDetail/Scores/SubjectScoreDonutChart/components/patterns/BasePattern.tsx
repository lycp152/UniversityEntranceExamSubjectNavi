import { FC } from "react";
import { COLORS } from "../../constants";
import { PATTERN_DIMENSIONS } from "./constants/dimensions";
import { BasePatternProps } from "./types";

const BasePattern: FC<BasePatternProps> = ({
  id,
  children,
  patternTransform,
}) => (
  <pattern
    id={`pattern-${id}`}
    patternUnits="userSpaceOnUse"
    width={PATTERN_DIMENSIONS.width}
    height={PATTERN_DIMENSIONS.height}
    patternTransform={patternTransform}
  >
    <rect
      width={PATTERN_DIMENSIONS.width}
      height={PATTERN_DIMENSIONS.height}
      fill={COLORS[id]}
    />
    {children}
  </pattern>
);

export default BasePattern;
