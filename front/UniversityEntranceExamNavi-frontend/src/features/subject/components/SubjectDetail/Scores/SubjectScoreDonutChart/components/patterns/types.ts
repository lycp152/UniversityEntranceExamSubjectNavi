import { COLORS } from "../../constants";

export interface BasePatternProps {
  id: keyof typeof COLORS;
  children: React.ReactNode;
  patternTransform?: string;
}
