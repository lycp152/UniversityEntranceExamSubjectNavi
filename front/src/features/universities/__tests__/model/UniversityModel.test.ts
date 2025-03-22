import { describe, it, expect } from "vitest";
import { UniversityModel } from "../../model/university";
import type {
  University,
  Major,
  Department,
} from "@/types/university/university";

describe("UniversityModel", () => {
  const mockMajor: Major = {
    id: 1,
    name: "情報工学科",
    departmentId: 1,
    admissionSchedules: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const mockDepartment: Department = {
    id: 1,
    name: "工学部",
    universityId: 1,
    majors: [mockMajor],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUniversity: University = {
    id: 1,
    name: "テスト大学",
    status: "active",
    departments: [
      { ...mockDepartment },
      {
        ...mockDepartment,
        id: 2,
        name: "理学部",
        majors: [{ ...mockMajor, id: 3, name: "物理学科", departmentId: 2 }],
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it("should create a university model", () => {
    const model = new UniversityModel(mockUniversity);
    expect(model).toBeInstanceOf(UniversityModel);
  });

  it("should return correct id", () => {
    const model = new UniversityModel(mockUniversity);
    expect(model.id).toBe(1);
  });

  it("should return correct name", () => {
    const model = new UniversityModel(mockUniversity);
    expect(model.name).toBe("テスト大学");
  });

  it("should return correct department count", () => {
    const model = new UniversityModel(mockUniversity);
    expect(model.departmentCount).toBe(2);
  });

  it("should check if department exists", () => {
    const model = new UniversityModel(mockUniversity);
    expect(model.hasDepartment(1)).toBe(true);
    expect(model.hasDepartment(999)).toBe(false);
  });

  it("should get department by id", () => {
    const model = new UniversityModel(mockUniversity);
    const department = model.getDepartment(1);
    expect(department).toBeDefined();
    expect(department?.name).toBe("工学部");
  });

  it("should return undefined for non-existent department", () => {
    const model = new UniversityModel(mockUniversity);
    const department = model.getDepartment(999);
    expect(department).toBeUndefined();
  });

  it("should convert to JSON", () => {
    const model = new UniversityModel(mockUniversity);
    const json = model.toJSON();
    expect(json).toEqual(mockUniversity);
  });
});
