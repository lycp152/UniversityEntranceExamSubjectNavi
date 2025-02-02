import { FC } from "react";
import { COLORS } from "../../constants";

export const SocialPattern: FC = () => (
  <pattern
    id="pattern-地歴公"
    patternUnits="userSpaceOnUse"
    width="8"
    height="8"
  >
    <rect width="8" height="8" fill={COLORS.地歴公} />
    <path
      d="M0,0 M0,8 L8,8 L8,0 L0,0"
      stroke="white"
      strokeWidth="1"
      strokeOpacity="0.5"
      fill="none"
    />
  </pattern>
);
