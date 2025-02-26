import { FC } from "react";
import { COLORS } from "@/lib/constants/subject";
import { PATTERN_DIMENSIONS } from "@/components/features/charts/subject/donut/patterns/constants/dimensions";
import { BasePatternProps } from "";

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
