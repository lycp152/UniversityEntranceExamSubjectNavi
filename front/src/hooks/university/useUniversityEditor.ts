import { useState } from "react";
import type {
  University,
  Department,
  TestType,
  Subject,
  Major,
  AdmissionSchedule,
  TestTypeName,
} from "@/lib/types/university/university";
import type { APITestType, APISubject } from "@/lib/types/university/api";
import {
  ADMISSION_STATUS,
  UNIVERSITY_STATUS,
} from "@/lib/config/university/status";
import { useUniversityData } from "./useUniversityData";
import { useSubjectData } from "../subject/useSubjectData";

interface EditMode {
  universityId: number;
  departmentId: number;
  isEditing: boolean;
  isNew?: boolean;
  insertIndex?: number;
}

interface BackupState {
  university: University;
  department: Department;
}

const transformSubjectToAPI = (subject: Subject): APISubject => ({
  id: subject.id,
  test_type_id: subject.testTypeId,
  name: subject.name,
  score: subject.maxScore,
  percentage: subject.weight,
  display_order: 0,
  created_at: subject.createdAt.toISOString(),
  updated_at: subject.updatedAt.toISOString(),
});

const transformSubjectFromAPI = (subject: APISubject): Subject => ({
  id: subject.id,
  testTypeId: subject.test_type_id,
  name: subject.name,
  maxScore: subject.score,
  minScore: 0,
  weight: subject.percentage,
  createdAt: new Date(subject.created_at ?? ""),
  updatedAt: new Date(subject.updated_at ?? ""),
});

const transformTestTypeToAPI = (testType: TestType): APITestType => ({
  id: testType.id,
  admission_schedule_id: testType.admissionScheduleId,
  name: testType.name,
  subjects: testType.subjects.map(transformSubjectToAPI),
  created_at: testType.createdAt.toISOString(),
  updated_at: testType.updatedAt.toISOString(),
});

const transformTestTypeFromAPI = (testType: APITestType): TestType => ({
  id: testType.id,
  admissionScheduleId: testType.admission_schedule_id,
  name: testType.name as TestTypeName,
  subjects: testType.subjects.map(transformSubjectFromAPI),
  createdAt: new Date(testType.created_at ?? ""),
  updatedAt: new Date(testType.updated_at ?? ""),
});

export function useUniversityEditor() {
  const {
    universities,
    setUniversities,
    error,
    setError,
    isLoading,
    setIsLoading,
    successMessage,
    setSuccessMessage,
    fetchUniversities,
    updateUniversity,
    updateDepartment,
    updateSubjects,
    updateMajor,
    updateAdmissionSchedule,
    updateAdmissionInfo,
  } = useUniversityData();

  const { calculateUpdatedSubjects, isCommonTestType, isIndividualTestType } =
    useSubjectData();

  const [editMode, setEditMode] = useState<EditMode | null>(null);
  const [backupState, setBackupState] = useState<BackupState | null>(null);

  const updateDepartmentField = (
    department: Department,
    field: string,
    value: string | number
  ) => {
    const major = department.majors[0];
    const admissionSchedule = major?.admissionSchedules?.[0];
    const admissionInfo = admissionSchedule?.admissionInfos?.[0];
    if (!major || !admissionSchedule || !admissionInfo) return department;

    const updatedDepartment = { ...department };
    const updatedMajor = { ...major };
    const updatedAdmissionSchedule = { ...admissionSchedule };
    const updatedAdmissionInfo = { ...admissionInfo };

    switch (field) {
      case "universityName":
        // 大学名は上位のhandleInfoChangeで処理
        break;
      case "departmentName":
        updatedDepartment.name = value as string;
        break;
      case "majorName":
        updatedMajor.name = value as string;
        break;
      case "enrollment":
        updatedAdmissionInfo.enrollment = value as number;
        break;
      case "schedule":
        updatedAdmissionSchedule.name = value as string;
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

  const updateDepartmentInUniversity = (
    university: University,
    departmentId: number,
    field: string,
    value: string | number
  ): University => {
    if (field === "universityName") {
      return {
        ...university,
        name: value as string,
      };
    }

    const updatedDepartments = university.departments.map(
      (department: Department) => {
        if (department.id !== departmentId) return department;
        return updateDepartmentField(department, field, value);
      }
    );

    return {
      ...university,
      departments: updatedDepartments,
    };
  };

  const handleInfoChange = (
    universityId: number,
    departmentId: number,
    field: string,
    value: string | number
  ) => {
    setUniversities((prevUniversities) =>
      prevUniversities.map((university) => {
        if (university.id !== universityId) return university;
        return updateDepartmentInUniversity(
          university,
          departmentId,
          field,
          value
        );
      })
    );
  };

  const updateDepartmentSubjects = (
    department: Department,
    subjectId: number,
    value: number,
    isCommon: boolean
  ) => {
    const major = department.majors[0];
    const admissionSchedule = major?.admissionSchedules?.[0];
    if (!major || !admissionSchedule) return department;

    const targetTestType = admissionSchedule.testTypes.find((type: TestType) =>
      isCommon
        ? isCommonTestType(transformTestTypeToAPI(type))
        : isIndividualTestType(transformTestTypeToAPI(type))
    );

    if (!targetTestType) return department;

    const updatedSubjects = calculateUpdatedSubjects(
      targetTestType.subjects.map(transformSubjectToAPI),
      subjectId,
      value
    ).map(transformSubjectFromAPI);

    return {
      ...department,
      majors: [
        {
          ...major,
          admissionSchedules: [
            {
              ...admissionSchedule,
              testTypes: admissionSchedule.testTypes.map((type: TestType) =>
                type.id === targetTestType.id
                  ? { ...type, subjects: updatedSubjects }
                  : type
              ),
            },
          ],
        },
      ],
    };
  };

  const updateUniversityDepartments = (
    university: University,
    departmentId: number,
    subjectId: number,
    value: number,
    isCommon: boolean
  ): University => ({
    ...university,
    departments: university.departments.map((department: Department) => {
      if (department.id !== departmentId) return department;
      return updateDepartmentSubjects(department, subjectId, value, isCommon);
    }),
  });

  const handleScoreChange = async (
    universityId: number,
    departmentId: number,
    subjectId: number,
    value: number,
    isCommon: boolean
  ) => {
    try {
      setUniversities((prevUniversities) =>
        prevUniversities.map((university) => {
          if (university.id !== universityId) return university;
          return updateUniversityDepartments(
            university,
            departmentId,
            subjectId,
            value,
            isCommon
          );
        })
      );
    } catch (error) {
      console.error("Error updating score:", error);
      setError("点数の更新に失敗しました。");
    }
  };

  const updateTestTypesWithNewSubject = (
    admissionSchedule: AdmissionSchedule,
    internalType: TestType,
    newSubject: Subject
  ): AdmissionSchedule => ({
    ...admissionSchedule,
    testTypes: admissionSchedule.testTypes.map((testType) => {
      if (testType.id === internalType.id) {
        return {
          ...testType,
          subjects: [...testType.subjects, newSubject],
        };
      }
      return testType;
    }),
  });

  const updateDepartmentWithNewSubject = (
    department: Department,
    internalType: TestType,
    newSubject: Subject
  ): Department => {
    const major: Major = department.majors[0];
    const admissionSchedule = major?.admissionSchedules?.[0];
    if (!major || !admissionSchedule) return department;

    return {
      ...department,
      majors: [
        {
          ...major,
          admissionSchedules: [
            updateTestTypesWithNewSubject(
              admissionSchedule,
              internalType,
              newSubject
            ),
          ],
        },
      ],
    };
  };

  const updateUniversityWithNewSubject = (
    university: University,
    departmentId: number,
    internalType: TestType,
    newSubject: Subject
  ): University => ({
    ...university,
    departments: university.departments.map((department) => {
      if (department.id !== departmentId) return department;
      return updateDepartmentWithNewSubject(
        department,
        internalType,
        newSubject
      );
    }),
  });

  const handleAddSubject = (
    universityId: number,
    departmentId: number,
    type: APITestType
  ) => {
    const internalType = transformTestTypeFromAPI(type);
    const newSubject: Subject = {
      id: 0,
      testTypeId: internalType.id,
      name: `科目${internalType.subjects.length + 1}`,
      maxScore: 100,
      minScore: 0,
      weight: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setUniversities((prevUniversities) =>
      prevUniversities.map((university) => {
        if (university.id !== universityId) return university;
        return updateUniversityWithNewSubject(
          university,
          departmentId,
          internalType,
          newSubject
        );
      })
    );
  };

  const updateTestTypesWithSubjectName = (
    testTypes: TestType[],
    subjectId: number,
    name: string
  ): TestType[] =>
    testTypes.map((testType) => ({
      ...testType,
      subjects: testType.subjects.map((subject) =>
        subject.id === subjectId ? { ...subject, name } : subject
      ),
    }));

  const updateDepartmentWithSubjectName = (
    department: Department,
    subjectId: number,
    name: string
  ): Department => {
    const admissionSchedule = department.majors[0]?.admissionSchedules[0];
    if (!admissionSchedule) return department;

    return {
      ...department,
      majors: [
        {
          ...department.majors[0],
          admissionSchedules: [
            {
              ...admissionSchedule,
              testTypes: updateTestTypesWithSubjectName(
                admissionSchedule.testTypes,
                subjectId,
                name
              ),
            },
          ],
        },
      ],
    };
  };

  const updateUniversityWithSubjectName = (
    university: University,
    departmentId: number,
    subjectId: number,
    name: string
  ): University => ({
    ...university,
    departments: (university.departments || []).map((department) => {
      if (department.id !== departmentId) return department;
      return updateDepartmentWithSubjectName(department, subjectId, name);
    }),
  });

  const handleSubjectNameChange = (
    universityId: number,
    departmentId: number,
    subjectId: number,
    name: string
  ) => {
    setUniversities((prevUniversities) =>
      prevUniversities.map((university) => {
        if (university.id !== universityId) return university;
        return updateUniversityWithSubjectName(
          university,
          departmentId,
          subjectId,
          name
        );
      })
    );
  };

  const handleEdit = (university: University, department: Department) => {
    const currentState = {
      university: { ...university },
      department: { ...department },
    };

    setBackupState(currentState);

    setEditMode({
      universityId: university.id,
      departmentId: department.id,
      isEditing: true,
    });
  };

  const handleCancel = () => {
    if (backupState) {
      setUniversities((prev: University[]) =>
        prev.map((u) =>
          u.id === backupState.university.id ? backupState.university : u
        )
      );
    }

    setEditMode(null);
    setBackupState(null);
    setError(null);
  };

  const handleSave = async (university: University, department: Department) => {
    try {
      setIsLoading(true);
      setError(null);

      const headers = {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      };

      const major = department.majors[0];
      const admissionSchedule = major?.admissionSchedules[0];
      const admissionInfo = admissionSchedule?.admissionInfos[0];

      await Promise.all(
        [
          updateUniversity(university, headers),
          updateDepartment(university, department, headers),
          updateSubjects(university, department, headers),
          major && updateMajor(department.id, major, headers),
          admissionSchedule &&
            updateAdmissionSchedule(major.id, admissionSchedule, headers),
          admissionInfo &&
            updateAdmissionInfo(admissionSchedule.id, admissionInfo, headers),
        ].filter(Boolean)
      );

      await fetchUniversities();

      setEditMode(null);
      setBackupState(null);
      setSuccessMessage("データが正常に更新されました");

      const timeoutId = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timeoutId);
    } catch (error) {
      console.error("Error updating data:", error);
      setError(
        error instanceof Error ? error.message : "データの更新に失敗しました。"
      );

      if (backupState) {
        setUniversities((prev: University[]) =>
          prev.map((u) =>
            u.id === backupState.university.id ? backupState.university : u
          )
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInsert = (index: number) => {
    const tempId = Date.now();

    setEditMode({
      universityId: tempId,
      departmentId: tempId + 1,
      isEditing: true,
      isNew: true,
      insertIndex: index,
    });

    const emptyUniversity: University = {
      id: tempId,
      name: "",
      createdAt: new Date(),
      updatedAt: new Date(),
      status: UNIVERSITY_STATUS.ACTIVE,
      departments: [
        {
          id: tempId + 1,
          name: "",
          universityId: tempId,
          createdAt: new Date(),
          updatedAt: new Date(),
          majors: [
            {
              id: tempId + 2,
              name: "",
              departmentId: tempId + 1,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              admissionSchedules: [
                {
                  id: tempId + 3,
                  majorId: tempId + 2,
                  name: "前期",
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                  startDate: new Date(),
                  endDate: new Date(),
                  status: ADMISSION_STATUS.UPCOMING,
                  displayOrder: 0,
                  admissionInfos: [],
                  testTypes: [
                    {
                      id: tempId + 5,
                      admissionScheduleId: tempId + 4,
                      name: "共通",
                      subjects: [],
                      createdAt: new Date(),
                      updatedAt: new Date(),
                    },
                    {
                      id: tempId + 6,
                      admissionScheduleId: tempId + 4,
                      name: "二次",
                      subjects: [],
                      createdAt: new Date(),
                      updatedAt: new Date(),
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };

    setUniversities((prev: University[]) => {
      const newUniversities = [...prev];
      newUniversities.splice(index, 0, emptyUniversity);
      return newUniversities;
    });
  };

  return {
    universities,
    setUniversities,
    error,
    setError,
    isLoading,
    setIsLoading,
    successMessage,
    setSuccessMessage,
    fetchUniversities,
    updateUniversity,
    updateDepartment,
    updateSubjects,
    editMode,
    setEditMode,
    handleEdit,
    handleCancel,
    handleSave,
    handleInfoChange,
    handleScoreChange,
    handleAddSubject,
    handleSubjectNameChange,
    handleInsert,
  };
}
