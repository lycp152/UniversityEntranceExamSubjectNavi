import { FC } from "react";
import BasePattern from "../base/BasePattern";
import StrokedPath from "../elements/StrokedPath";
import { PATTERN_PATHS } from "../constants/paths";

const JapanesePattern: FC = () => (
  <BasePattern id="国語">
    <StrokedPath d={PATTERN_PATHS.japanese} />
  </BasePattern>
);

export default JapanesePattern;
