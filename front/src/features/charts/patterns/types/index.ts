import { ReactNode } from "react";
import { SubjectName } from "@/constants/subjects2";

export interface BasePatternProps {
  id: SubjectName;
  children?: ReactNode;
  patternTransform?: string;
}
