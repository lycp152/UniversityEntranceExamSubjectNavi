/**
 * 大学の状態定数
 */
export const UNIVERSITY_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  DELETED: 'deleted',
} as const;

/**
 * 入試情報の状態定数
 */
export const ADMISSION_STATUS = {
  UPCOMING: 'upcoming',
  ONGOING: 'ongoing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

/**
 * データの取得状態定数
 */
export const FETCH_STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
} as const;
