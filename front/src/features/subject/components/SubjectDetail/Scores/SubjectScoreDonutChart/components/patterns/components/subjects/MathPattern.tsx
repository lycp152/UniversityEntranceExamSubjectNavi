import { FC } from "react";
import BasePattern from "../base/BasePattern";
import FilledCircle from "../../elements/FilledCircle";
import { PATTERN_POINTS } from "../../constants/paths";

const MathPattern: FC = () => (
  <BasePattern id="数学">
    <FilledCircle {...PATTERN_POINTS.math} />
  </BasePattern>
);

export default MathPattern;
