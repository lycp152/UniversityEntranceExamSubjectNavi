import { FC } from "react";
import BasePattern from "../base/BasePattern";
import StrokedPath from "../elements/StrokedPath";
import { PATTERN_PATHS } from "../constants/paths";
import { SUBJECT_BASE_CATEGORIES } from "@/constants/subjects";

const SciencePattern: FC = () => (
  <BasePattern id={SUBJECT_BASE_CATEGORIES.SCIENCE}>
    <StrokedPath d={PATTERN_PATHS.science} />
  </BasePattern>
);

export default SciencePattern;
