import type { Department, University } from '@/features/admin/types/university';
import type { AdmissionScheduleName } from '@/constants/constraint/admission-schedule';
import { ADMISSION_SCHEDULE_CONSTRAINTS } from '@/constants/constraint/admission-schedule';

/**
 * 部門フィールドの更新を行う関数
 * @param department - 更新対象の部門
 * @param field - 更新するフィールド名
 * @param value - 更新する値
 * @returns 更新後の部門
 */
export const updateDepartmentField = (
  department: Department,
  field: string,
  value: string | number
): Department => {
  if (!validateDepartmentUpdate(department, field, value)) {
    return department;
  }

  const major = department.majors[0];
  const admissionSchedule = major?.admissionSchedules?.[0];
  const admissionInfo = admissionSchedule?.admissionInfos?.[0];
  if (!major || !admissionSchedule || !admissionInfo) return department;

  const updatedDepartment = { ...department };
  const updatedMajor = { ...major };
  const updatedAdmissionSchedule = { ...admissionSchedule };
  const updatedAdmissionInfo = { ...admissionInfo };

  switch (field) {
    case 'universityName':
      // 大学名は上位のhandleInfoChangeで処理
      break;
    case 'departmentName':
      updatedDepartment.name = value as string;
      break;
    case 'majorName':
      updatedMajor.name = value as string;
      break;
    case 'enrollment':
      updatedAdmissionInfo.enrollment = value as number;
      break;
    case 'schedule':
      updatedAdmissionSchedule.name = value as AdmissionScheduleName;
      break;
    default:
      console.warn(`Unknown field: ${field}`);
      return department;
  }

  updatedAdmissionSchedule.admissionInfos = [updatedAdmissionInfo];
  updatedMajor.admissionSchedules = [updatedAdmissionSchedule];
  updatedDepartment.majors = [updatedMajor];

  return updatedDepartment;
};

/**
 * 大学内の部門を更新する関数
 * @param university - 更新対象の大学
 * @param departmentId - 更新する部門のID
 * @param field - 更新するフィールド名
 * @param value - 更新する値
 * @returns 更新後の大学
 */
export const updateDepartmentInUniversity = (
  university: University,
  departmentId: number,
  field: string,
  value: string | number
): University => {
  if (field === 'universityName') {
    return {
      ...university,
      name: value as string,
    };
  }

  const department = university.departments.find(d => d.id === departmentId);
  if (!department) return university;

  const updatedDepartments = university.departments.map((department: Department) => {
    if (department.id !== departmentId) return department;
    return updateDepartmentField(department, field, value);
  });

  return {
    ...university,
    departments: updatedDepartments,
  };
};

/**
 * 部門の更新を検証する関数
 * @param department - 更新対象の部門
 * @param field - 更新するフィールド名
 * @param value - 更新する値
 * @returns 検証結果
 */
export const validateDepartmentUpdate = (
  department: Department,
  field: string,
  value: string | number
): boolean => {
  const major = department.majors[0];
  const admissionSchedule = major?.admissionSchedules?.[0];
  const admissionInfo = admissionSchedule?.admissionInfos?.[0];

  if (!major || !admissionSchedule || !admissionInfo) return false;

  switch (field) {
    case 'departmentName':
      return typeof value === 'string' && value.length > 0;
    case 'majorName':
      return typeof value === 'string' && value.length > 0;
    case 'enrollment':
      return typeof value === 'number' && value >= 0;
    case 'schedule':
      return (
        typeof value === 'string' &&
        ADMISSION_SCHEDULE_CONSTRAINTS.VALID_NAMES.includes(value as AdmissionScheduleName)
      );
    default:
      return false;
  }
};
