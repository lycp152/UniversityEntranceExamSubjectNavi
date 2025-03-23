import { FC } from "react";
import { SUBJECT_CATEGORY_COLORS } from "@/constants/subjects";
import { PATTERN_DIMENSIONS } from "@/features/charts/patterns/constants/dimensions";
import { BasePatternProps } from "../types";
import { getSubjectBaseCategory } from "@/utils/validation/subject-type-validator";

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
      fill={SUBJECT_CATEGORY_COLORS[getSubjectBaseCategory(id)]}
    />
    {children}
  </pattern>
);

export default BasePattern;
