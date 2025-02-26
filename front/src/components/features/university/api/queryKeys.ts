export const UNIVERSITY_KEYS = {
  all: ['universities'] as const,
  lists: () => [...UNIVERSITY_KEYS.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...UNIVERSITY_KEYS.lists(), { filters }] as const,
  details: () => [...UNIVERSITY_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...UNIVERSITY_KEYS.details(), id] as const,
} as const;
