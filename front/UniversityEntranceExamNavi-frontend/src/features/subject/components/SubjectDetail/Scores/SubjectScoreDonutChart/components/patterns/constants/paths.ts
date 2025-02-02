import { PATTERN_DIMENSIONS } from "./dimensions";

export const PATTERN_PATHS = {
  japanese: "M0,0 L8,8 M8,0 L0,8",
  science: "M0,4 Q2,0 4,4 T8,4",
  social: "M0,0 M0,8 L8,8 L8,0 L0,0",
} as const;

export const PATTERN_POINTS = {
  math: {
    cx: PATTERN_DIMENSIONS.width / 2,
    cy: PATTERN_DIMENSIONS.height / 2,
    r: 1.5,
  },
  english: {
    x1: 0,
    y1: 0,
    x2: 0,
    y2: PATTERN_DIMENSIONS.height,
  },
} as const;
