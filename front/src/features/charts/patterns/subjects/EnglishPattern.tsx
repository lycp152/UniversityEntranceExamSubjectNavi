import { FC } from "react";
import BasePattern from "../base/BasePattern";
import StrokedPath from "../elements/StrokedPath";
import { PATTERN_PATHS } from "../constants/paths";
import { SUBJECT_CATEGORIES } from "@/constants/subjects";

const EnglishPattern: FC = () => (
  <BasePattern id={SUBJECT_CATEGORIES.ENGLISH.category}>
    <StrokedPath d={PATTERN_PATHS.english} />
  </BasePattern>
);

export default EnglishPattern;
