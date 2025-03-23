import { ReactNode } from "react";
import { SubjectName } from "@/constants/subjects";

export interface BasePatternProps {
  id: SubjectName;
  children?: ReactNode;
  patternTransform?: string;
}
