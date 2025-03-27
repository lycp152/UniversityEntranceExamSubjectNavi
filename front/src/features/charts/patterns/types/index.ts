import { ReactNode } from "react";
import { SubjectCategory } from "@/constants/subjects";

export interface BasePatternProps {
  id: SubjectCategory;
  children?: ReactNode;
  patternTransform?: string;
}
