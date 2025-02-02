import { FC } from "react";
import { COLORS } from "../../constants";

export const SciencePattern: FC = () => (
  <pattern id="pattern-理科" patternUnits="userSpaceOnUse" width="8" height="8">
    <rect width="8" height="8" fill={COLORS.理科} />
    <path
      d="M0,4 Q2,0 4,4 T8,4"
      stroke="white"
      strokeWidth="1"
      strokeOpacity="0.5"
      fill="none"
    />
  </pattern>
);
