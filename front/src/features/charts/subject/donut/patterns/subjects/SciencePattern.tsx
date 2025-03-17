import { FC } from "react";
import BasePattern from "../base/BasePattern";
import StrokedPath from "../elements/StrokedPath";
import { PATTERN_PATHS } from "../constants/paths";

const SciencePattern: FC = () => (
  <BasePattern id="理科">
    <StrokedPath d={PATTERN_PATHS.science} />
  </BasePattern>
);

export default SciencePattern;
