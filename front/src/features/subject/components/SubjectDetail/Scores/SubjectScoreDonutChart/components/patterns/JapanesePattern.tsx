import { FC } from "react";
import { COLORS } from "../../constants";

export const JapanesePattern: FC = () => (
  <pattern id="pattern-国語" patternUnits="userSpaceOnUse" width="8" height="8">
    <rect width="8" height="8" fill={COLORS.国語} />
    <path
      d="M0,0 L8,8 M8,0 L0,8"
      stroke="white"
      strokeWidth="1"
      strokeOpacity="0.5"
    />
  </pattern>
);
