import { describe, it, expect } from 'vitest';
import { DepartmentModel } from '../../model/department';
import type { Department, Major } from '@/lib/types/university/university';

describe('DepartmentModel', () => {
  const mockMajor: Major = {
    id: 1,
    name: '情報工学科',
    departmentId: 1,
    examInfos: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockDepartment: Department = {
    id: 1,
    name: '工学部',
    universityId: 1,
    majors: [
      mockMajor,
      {
        ...mockMajor,
        id: 2,
        name: '機械工学科',
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('should create a department model', () => {
    const model = new DepartmentModel(mockDepartment);
    expect(model).toBeInstanceOf(DepartmentModel);
  });

  it('should return correct id', () => {
    const model = new DepartmentModel(mockDepartment);
    expect(model.id).toBe(1);
  });

  it('should return correct name', () => {
    const model = new DepartmentModel(mockDepartment);
    expect(model.name).toBe('工学部');
  });

  it('should return correct major count', () => {
    const model = new DepartmentModel(mockDepartment);
    expect(model.majorCount).toBe(2);
  });

  it('should check if major exists', () => {
    const model = new DepartmentModel(mockDepartment);
    expect(model.hasMajor(1)).toBe(true);
    expect(model.hasMajor(999)).toBe(false);
  });

  it('should get major by id', () => {
    const model = new DepartmentModel(mockDepartment);
    const major = model.getMajor(1);
    expect(major).toBeDefined();
    expect(major?.name).toBe('情報工学科');
  });

  it('should return undefined for non-existent major', () => {
    const model = new DepartmentModel(mockDepartment);
    const major = model.getMajor(999);
    expect(major).toBeUndefined();
  });

  it('should convert to JSON', () => {
    const model = new DepartmentModel(mockDepartment);
    const json = model.toJSON();
    expect(json).toEqual(mockDepartment);
  });
});
