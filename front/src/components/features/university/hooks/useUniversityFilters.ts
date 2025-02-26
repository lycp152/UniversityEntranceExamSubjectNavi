import { useState, useCallback } from 'react';
import type { UniversityFilters } from '../api/types';

export const useUniversityFilters = () => {
  const [filters, setFilters] = useState<UniversityFilters>({
    name: '',
    departmentCount: undefined,
    sortBy: 'name',
    sortOrder: 'asc',
  });

  const updateFilter = useCallback(
    <K extends keyof UniversityFilters>(key: K, value: UniversityFilters[K]) => {
      setFilters((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
    []
  );

  const resetFilters = useCallback(() => {
    setFilters({
      name: '',
      departmentCount: undefined,
      sortBy: 'name',
      sortOrder: 'asc',
    });
  }, []);

  return {
    filters,
    updateFilter,
    resetFilters,
  };
};
