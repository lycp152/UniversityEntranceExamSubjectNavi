import { FC } from "react";
import BasePattern from "../base/BasePattern";
import StrokedPath from "../elements/StrokedPath";
import { PATTERN_PATHS } from "../constants/paths";
import { SUBJECT_CATEGORIES } from "@/constants/subjects";

const JapanesePattern: FC = () => (
  <BasePattern id={SUBJECT_CATEGORIES.JAPANESE.category}>
    <StrokedPath d={PATTERN_PATHS.japanese} />
  </BasePattern>
);

export default JapanesePattern;
