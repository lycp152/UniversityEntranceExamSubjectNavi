import { FC } from "react";
import BasePattern from "../base/BasePattern";
import StrokedLine from "../elements/StrokedLine";
import { PATTERN_POINTS } from "../constants/paths";

const EnglishPattern: FC = () => (
  <BasePattern id="英語" patternTransform="rotate(45)">
    <StrokedLine {...PATTERN_POINTS.english} strokeWidth="2" />
  </BasePattern>
);

export default EnglishPattern;
