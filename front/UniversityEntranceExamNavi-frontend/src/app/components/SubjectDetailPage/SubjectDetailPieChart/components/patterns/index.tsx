import { FC } from "react";
import { EnglishPattern } from "./EnglishPattern";
import { MathPattern } from "./MathPattern";
import { JapanesePattern } from "./JapanesePattern";
import { SciencePattern } from "./SciencePattern";
import { SocialPattern } from "./SocialPattern";

export const Patterns: FC = () => (
  <>
    <EnglishPattern />
    <MathPattern />
    <JapanesePattern />
    <SciencePattern />
    <SocialPattern />
  </>
);
