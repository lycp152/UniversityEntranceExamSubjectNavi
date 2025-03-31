import { create } from "zustand";
import type { University } from "@/types/universities/university";
import type { UniversityFilters } from "../api/types";

interface UniversityStore {
  selectedUniversity: University | null;
  filters: UniversityFilters;
  setSelectedUniversity: (university: University | null) => void;
  updateFilters: (filters: Partial<UniversityFilters>) => void;
  resetFilters: () => void;
}

export const useUniversityStore = create<UniversityStore>((set) => ({
  selectedUniversity: null,
  filters: {
    name: "",
    departmentCount: undefined,
    sortBy: "name",
    sortOrder: "asc",
  },

  setSelectedUniversity: (university) =>
    set({ selectedUniversity: university }),

  updateFilters: (newFilters) =>
    set((state) => ({
      filters: {
        ...state.filters,
        ...newFilters,
      },
    })),

  resetFilters: () =>
    set({
      filters: {
        name: "",
        departmentCount: undefined,
        sortBy: "name",
        sortOrder: "asc",
      },
    }),
}));
