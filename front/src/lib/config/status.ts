/**
 * 大学の状態定数
 */
export const UNIVERSITY_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  PENDING: "pending",
  DELETED: "deleted",
} as const;

export type UniversityStatus =
  (typeof UNIVERSITY_STATUS)[keyof typeof UNIVERSITY_STATUS];

/**
 * 入試情報の状態定数
 */
export const ADMISSION_STATUS = {
  UPCOMING: "upcoming",
  ONGOING: "ongoing",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

export type AdmissionStatus =
  (typeof ADMISSION_STATUS)[keyof typeof ADMISSION_STATUS];

/**
 * データの取得状態定数
 */
export const FETCH_STATUS = {
  IDLE: "idle",
  LOADING: "loading",
  SUCCESS: "success",
  ERROR: "error",
} as const;

export type FetchStatus = (typeof FETCH_STATUS)[keyof typeof FETCH_STATUS];
