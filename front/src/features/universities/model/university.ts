import type { University, Department } from "@/types/universities/university";

export class UniversityModel {
  constructor(private readonly data: University) {}

  get id(): number {
    return this.data.id;
  }

  get name(): string {
    return this.data.name;
  }

  get departmentCount(): number {
    return this.data.departments.length;
  }

  get departments(): Department[] {
    return this.data.departments;
  }

  hasDepartment(departmentId: number): boolean {
    return this.data.departments.some((dept) => dept.id === departmentId);
  }

  getDepartment(departmentId: number): Department | undefined {
    return this.data.departments.find((dept) => dept.id === departmentId);
  }

  toJSON(): University {
    return { ...this.data };
  }
}
