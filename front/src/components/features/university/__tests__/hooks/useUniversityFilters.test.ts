import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useUniversityFilters } from '../../hooks/useUniversityFilters';

describe('useUniversityFilters', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => useUniversityFilters());

    expect(result.current.filters).toEqual({
      name: '',
      departmentCount: undefined,
      sortBy: 'name',
      sortOrder: 'asc',
    });
  });

  it('should update filter value', () => {
    const { result } = renderHook(() => useUniversityFilters());

    result.current.updateFilter('name', 'テスト大学');
    expect(result.current.filters.name).toBe('テスト大学');
  });

  it('should update multiple filter values', () => {
    const { result } = renderHook(() => useUniversityFilters());

    result.current.updateFilter('name', 'テスト大学');
    result.current.updateFilter('departmentCount', 5);

    expect(result.current.filters).toEqual({
      name: 'テスト大学',
      departmentCount: 5,
      sortBy: 'name',
      sortOrder: 'asc',
    });
  });

  it('should reset filters to default values', () => {
    const { result } = renderHook(() => useUniversityFilters());

    result.current.updateFilter('name', 'テスト大学');
    result.current.updateFilter('departmentCount', 5);
    result.current.resetFilters();

    expect(result.current.filters).toEqual({
      name: '',
      departmentCount: undefined,
      sortBy: 'name',
      sortOrder: 'asc',
    });
  });
});
