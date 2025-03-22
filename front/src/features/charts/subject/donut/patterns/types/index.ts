import { ReactNode } from "react";
import { SubjectName } from "@/features/subjects/constants";

export interface BasePatternProps {
  id: SubjectName;
  children?: ReactNode;
  patternTransform?: string;
}
