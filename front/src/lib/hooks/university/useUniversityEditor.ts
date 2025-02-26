import { useState } from "react";
import type {
  University,
  Department,
  TestType,
  Subject,
} from "@/lib/types/university/university";
import type {
  APITestType,
  APISubject,
  APIAdmissionSchedule,
} from "@/lib/types/university/api";
import {
  transformToAPITestType,
  transformToAPISubject,
  transformTestType,
  transformSubject,
} from "@/lib/utils/university/transform";
import {
  ADMISSION_STATUS,
  UNIVERSITY_STATUS,
} from "@/lib/config/university/status";
import { useUniversityData } from "./useUniversityData";
import { useSubjectData } from "../subject/useSubjectData";
import { API_ENDPOINTS } from "../../config/admin/api";

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
  } = useUniversityData();

  const { calculateUpdatedSubjects, findTargetTestType, createNewSubject } =
    useSubjectData();

  const [editMode, setEditMode] = useState<EditMode | null>(null);
  const [backupState, setBackupState] = useState<BackupState | null>(null);

  const updateDepartmentField = (
    department: Department,
    field: string,
    value: string | number
  ) => {
    const major = department.majors[0];
    const admissionInfo = major?.examInfos[0];
    if (!major || !admissionInfo) return department;

    const updatedDepartment = { ...department };
    const updatedMajor = { ...major };
    const updatedAdmissionInfo = { ...admissionInfo };

    switch (field) {
      case "departmentName":
        updatedDepartment.name = value as string;
        break;
      case "majorName":
        updatedMajor.name = value as string;
        break;
      case "enrollment":
        updatedAdmissionInfo.enrollment = value as number;
        break;
      default:
        console.warn(`Unknown field: ${field}`);
        return department;
    }

    updatedMajor.examInfos = [updatedAdmissionInfo];
    updatedDepartment.majors = [updatedMajor];

    return updatedDepartment;
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
    const admissionInfo = major?.examInfos[0];
    if (!major || !admissionInfo) return department;

    const targetTestType = admissionInfo.admissionSchedules.reduce<
      TestType | undefined
    >((found: TestType | undefined, schedule) => {
      if (found) return found;
      return schedule.testTypes.find((type: TestType) =>
        findTargetTestType(type, isCommon)
      );
    }, undefined);

    if (!targetTestType) return department;

    const updatedSubjects = calculateUpdatedSubjects(
      targetTestType.subjects,
      subjectId,
      value
    );

    return {
      ...department,
      majors: [
        {
          ...major,
          examInfos: [
            {
              ...admissionInfo,
              admissionSchedules: admissionInfo.admissionSchedules.map(
                (schedule) => ({
                  ...schedule,
                  testTypes: schedule.testTypes.map((type: TestType) =>
                    type.id === targetTestType.id
                      ? { ...type, subjects: updatedSubjects }
                      : type
                  ),
                })
              ),
            },
          ],
        },
      ],
    };
  };

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

          const updatedDepartments = university.departments.map(
            (department: Department) => {
              if (department.id !== departmentId) return department;
              return updateDepartmentSubjects(
                department,
                subjectId,
                value,
                isCommon
              );
            }
          );

          return {
            ...university,
            departments: updatedDepartments,
          };
        })
      );
    } catch (error) {
      console.error("Error updating score:", error);
      setError("点数の更新に失敗しました。");
    }
  };

  const handleAddSubject = (
    universityId: number,
    departmentId: number,
    type: TestType
  ) => {
    const apiType = transformToAPITestType(type);

    setUniversities((prevUniversities) =>
      prevUniversities.map((university) => {
        if (university.id !== universityId) return university;

        return {
          ...university,
          departments: (university.departments || []).map(
            (department: Department) => {
              if (department.id !== departmentId) return department;

              const admissionInfo = department.majors[0]?.examInfos[0];
              if (!admissionInfo) return department;

              const newSubject: APISubject = {
                id: 0,
                test_type_id: apiType.id,
                name: `科目${apiType.subjects.length + 1}`,
                score: 100,
                percentage: 1,
                display_order: apiType.subjects.length + 1,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              };

              return {
                ...department,
                majors: [
                  {
                    ...department.majors[0],
                    examInfos: [
                      {
                        ...admissionInfo,
                        admissionSchedules:
                          admissionInfo.admissionSchedules.map((schedule) => {
                            const apiSchedule: APIAdmissionSchedule = {
                              id: schedule.id,
                              admission_info_id: schedule.examInfoId,
                              name: schedule.name,
                              display_order: 0,
                              test_types: schedule.testTypes.map((testType) => {
                                const internalTestType: TestType = {
                                  id: testType.id,
                                  admissionScheduleId: schedule.id,
                                  name: testType.name,
                                  subjects: testType.subjects.map(
                                    (subject) => ({
                                      id: subject.id,
                                      testTypeId: testType.id,
                                      name: subject.name,
                                      code: "",
                                      maxScore: subject.maxScore || 100,
                                      minScore: 0,
                                      weight: subject.weight || 1,
                                      createdAt: new Date(
                                        subject.created_at ||
                                          new Date().toISOString()
                                      ),
                                      updatedAt: new Date(
                                        subject.updated_at ||
                                          new Date().toISOString()
                                      ),
                                    })
                                  ),
                                  createdAt: new Date(
                                    testType.created_at ||
                                      new Date().toISOString()
                                  ),
                                  updatedAt: new Date(
                                    testType.updated_at ||
                                      new Date().toISOString()
                                  ),
                                };

                                const apiTestType =
                                  transformToAPITestType(internalTestType);

                                if (apiTestType.id === apiType.id) {
                                  return {
                                    ...apiTestType,
                                    subjects: [
                                      ...apiTestType.subjects,
                                      newSubject,
                                    ],
                                  };
                                }
                                return apiTestType;
                              }),
                              created_at: schedule.createdAt.toISOString(),
                              updated_at: schedule.updatedAt.toISOString(),
                            };
                            return apiSchedule;
                          }),
                      },
                    ],
                  },
                ],
              };
            }
          ),
        };
      })
    );
  };

  const handleSubjectNameChange = (
    universityId: number,
    departmentId: number,
    subjectId: number,
    name: string
  ) => {
    setUniversities((prevUniversities) =>
      prevUniversities.map((university) => {
        if (university.id !== universityId) return university;

        return {
          ...university,
          departments: (university.departments || []).map(
            (department: Department) => {
              if (department.id !== departmentId) return department;

              const admissionInfo = department.majors[0]?.examInfos[0];
              if (!admissionInfo) return department;

              return {
                ...department,
                majors: [
                  {
                    ...department.majors[0],
                    examInfos: [
                      {
                        ...admissionInfo,
                        admissionSchedules:
                          admissionInfo.admissionSchedules.map((schedule) => ({
                            ...schedule,
                            testTypes: schedule.testTypes.map(
                              (testType: TestType) => ({
                                ...testType,
                                subjects: testType.subjects.map((subject) =>
                                  subject.id === subjectId
                                    ? { ...subject, name }
                                    : subject
                                ),
                              })
                            ),
                          })),
                      },
                    ],
                  },
                ],
              };
            }
          ),
        };
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

      await Promise.all([
        updateUniversity(university, headers),
        updateDepartment(university, department, headers),
        updateSubjects(university, department, headers),
      ]);

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
      code: "",
      createdAt: new Date(),
      updatedAt: new Date(),
      status: UNIVERSITY_STATUS.ACTIVE,
      departments: [
        {
          id: tempId + 1,
          name: "",
          universityId: tempId,
          code: "",
          createdAt: new Date(),
          updatedAt: new Date(),
          majors: [
            {
              id: tempId + 2,
              name: "",
              departmentId: tempId + 1,
              code: "",
              createdAt: new Date(),
              updatedAt: new Date(),
              examInfos: [
                {
                  id: tempId + 3,
                  majorId: tempId + 2,
                  enrollment: 0,
                  year: new Date().getFullYear(),
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  admissionSchedules: [
                    {
                      id: tempId + 4,
                      examInfoId: tempId + 3,
                      name: "前期",
                      createdAt: new Date(),
                      updatedAt: new Date(),
                      startDate: new Date(),
                      endDate: new Date(),
                      status: ADMISSION_STATUS.UPCOMING,
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
