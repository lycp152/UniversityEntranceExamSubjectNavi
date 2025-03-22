import type { Department, University } from "@/types/university/university";

export const SCHEDULE_OPTIONS = ["前", "中", "後"] as const;
export type ScheduleOption = (typeof SCHEDULE_OPTIONS)[number];

export interface DepartmentInfoProps {
  department: Department;
  university: University;
  isEditing: boolean;
  onInfoChange: (field: string, value: string | number) => void;
}
