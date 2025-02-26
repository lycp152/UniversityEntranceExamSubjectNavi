import type { Department, Major } from '@/lib/types/university/university';

export class DepartmentModel {
  constructor(private readonly data: Department) {}

  get id(): number {
    return this.data.id;
  }

  get name(): string {
    return this.data.name;
  }

  get majorCount(): number {
    return this.data.majors.length;
  }

  get majors(): Major[] {
    return this.data.majors;
  }

  hasMajor(majorId: number): boolean {
    return this.data.majors.some((major) => major.id === majorId);
  }

  getMajor(majorId: number): Major | undefined {
    return this.data.majors.find((major) => major.id === majorId);
  }

  toJSON(): Department {
    return { ...this.data };
  }
}
