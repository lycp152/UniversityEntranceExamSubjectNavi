import { ReactNode } from "react";
import { SubjectCategory } from "@/types/subject";

export interface BasePatternProps {
  id: SubjectCategory;
  children?: ReactNode;
  patternTransform?: string;
}
