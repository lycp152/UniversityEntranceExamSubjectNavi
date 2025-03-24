import { ReactNode } from "react";
import { SubjectCategory } from "@/types/subjects";

export interface BasePatternProps {
  id: SubjectCategory;
  children?: ReactNode;
  patternTransform?: string;
}
