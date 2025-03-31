import { FC } from "react";
import { SUBJECT_CATEGORIES } from "@/constants/subjects";
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
      fill={SUBJECT_CATEGORIES[getSubjectBaseCategory(id)].color}
    />
    {children}
  </pattern>
);

export default BasePattern;
