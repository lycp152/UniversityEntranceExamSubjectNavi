import { FC } from "react";
import BasePattern from "../base/BasePattern";
import StrokedPath from "../elements/StrokedPath";
import { PATTERN_PATHS } from "../constants/paths";
import { SUBJECT_CATEGORIES } from "@/constants/subjects";

const MathPattern: FC = () => (
  <BasePattern id={SUBJECT_CATEGORIES.MATH.category}>
    <StrokedPath d={PATTERN_PATHS.math} />
  </BasePattern>
);

export default MathPattern;
