import { FC } from "react";
import { COLORS } from "../../constants";

export const EnglishPattern: FC = () => (
  <pattern
    id="pattern-英語"
    patternUnits="userSpaceOnUse"
    width="8"
    height="8"
    patternTransform="rotate(45)"
  >
    <rect width="8" height="8" fill={COLORS.英語} />
    <line
      x1="0"
      y="0"
      x2="0"
      y2="8"
      stroke="white"
      strokeWidth="2"
      strokeOpacity="0.5"
    />
  </pattern>
);
