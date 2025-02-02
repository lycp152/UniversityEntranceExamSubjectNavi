import { FC } from "react";
import { COLORS } from "../../constants";

export const MathPattern: FC = () => (
  <pattern id="pattern-数学" patternUnits="userSpaceOnUse" width="8" height="8">
    <rect width="8" height="8" fill={COLORS.数学} />
    <circle cx="4" cy="4" r="1.5" fill="white" fillOpacity="0.5" />
  </pattern>
);
