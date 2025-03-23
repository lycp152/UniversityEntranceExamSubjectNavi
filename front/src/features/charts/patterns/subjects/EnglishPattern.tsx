import { FC } from "react";
import BasePattern from "../base/BasePattern";
import StrokedPath from "../elements/StrokedPath";
import { PATTERN_PATHS } from "../constants/paths";
import { SUBJECT_BASE_CATEGORIES } from "@/constants/subjects";

const EnglishPattern: FC = () => (
  <BasePattern id={SUBJECT_BASE_CATEGORIES.ENGLISH}>
    <StrokedPath d={PATTERN_PATHS.english} />
  </BasePattern>
);

export default EnglishPattern;
