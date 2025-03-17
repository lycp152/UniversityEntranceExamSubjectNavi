import { FC } from "react";
import BasePattern from "../base/BasePattern";
import StrokedPath from "../elements/StrokedPath";
import { PATTERN_PATHS } from "../constants/paths";

const SocialPattern: FC = () => (
  <BasePattern id="地歴公">
    <StrokedPath d={PATTERN_PATHS.social} />
  </BasePattern>
);

export default SocialPattern;
