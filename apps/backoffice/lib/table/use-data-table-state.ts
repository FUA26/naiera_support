/**
 * Use Data Table State Hook
 *
 * Manages table state with URL synchronization using nuqs
 */

"use client";

import type {
  ColumnFiltersState,
  PaginationState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";
import { useQueryStates } from "nuqs";
import { useCallback } from "react";

/**
 * Nuqs parsers for table state
 */
const tableStateParsers = {
  // Sorting: ?sort=name:asc,role:desc
  sort: {
    parse: (value: string | null): SortingState => {
      if (!value) return [];
      return value.split(",").map((s) => {
        const [id, desc] = s.split(":");
        return { id: id || "", desc: desc === "desc" };
      });
    },
    serialize: (value: SortingState): string => {
      return value.map((s) => `${s.id}:${s.desc ? "desc" : "asc"}`).join(",");
    },
    eq: (a: SortingState, b: SortingState) => {
      return JSON.stringify(a) === JSON.stringify(b);
    },
  },

  // Filters: ?filter[name]=admin&filter[role]=user
  // Note: nuqs handles this automatically with dot notation
  // We'll use filter[name] style
  filters: {
    parse: (value: Record<string, string | string[]> | null): ColumnFiltersState => {
      if (!value) return [];
      return Object.entries(value).map(([id, value]) => ({
        id,
        value: Array.isArray(value) ? value : value,
      }));
    },
    serialize: (value: ColumnFiltersState): Record<string, string | string[]> => {
      const result: Record<string, string | string[]> = {};
      value.forEach((f) => {
        if (typeof f.value === "string") {
          result[f.id] = f.value;
        } else if (Array.isArray(f.value)) {
          result[f.id] = f.value as string[];
        }
      });
      return result;
    },
    eq: (a: ColumnFiltersState, b: ColumnFiltersState) => {
      return JSON.stringify(a) === JSON.stringify(b);
    },
  },

  // Pagination: ?page=1&perPage=10
  page: {
    parse: (value: string | null): number => {
      return value ? parseInt(value, 10) : 1;
    },
    serialize: (value: number): string => {
      return value.toString();
    },
    eq: (a: number, b: number) => a === b,
  },

  perPage: {
    parse: (value: string | null): number => {
      return value ? parseInt(value, 10) : 10;
    },
    serialize: (value: number): string => {
      return value.toString();
    },
    eq: (a: number, b: number) => a === b,
  },

  // Column visibility: ?columns=name,email,role
  columns: {
    parse: (value: string | null): VisibilityState => {
      if (!value) return {};
      const columns = value.split(",");
      return columns.reduce((acc, col) => ({ ...acc, [col]: true }), {});
    },
    serialize: (value: VisibilityState): string => {
      return Object.entries(value)
        .filter(([, visible]) => visible)
        .map(([col]) => col)
        .join(",");
    },
    eq: (a: VisibilityState, b: VisibilityState) => {
      return JSON.stringify(a) === JSON.stringify(b);
    },
  },
};

/**
 * Hook to manage table state with URL synchronization
 *
 * @example
 * ```tsx
 * const [sorting, setSorting, sortingDefaults] = useTableSorting();
 * const [filters, setFilters, filtersDefaults] = useTableFilters();
 * ```
 */
export function useDataTableState() {
  const [state, setState] = useQueryStates({
    sort: {
      ...tableStateParsers.sort,
      defaultValue: [],
    },
    page: {
      ...tableStateParsers.page,
      defaultValue: 1,
    },
    perPage: {
      ...tableStateParsers.perPage,
      defaultValue: 10,
    },
    columns: {
      ...tableStateParsers.columns,
      defaultValue: {},
    },
  });

  // Convert to TanStack Table formats
  const sorting: SortingState = state.sort;
  const pagination: PaginationState = {
    pageIndex: state.page - 1, // TanStack uses 0-based
    pageSize: state.perPage,
  };
  const columnVisibility: VisibilityState = state.columns;

  // Setters that update URL
  const setSorting = useCallback(
    (newSorting: SortingState | ((prev: SortingState) => SortingState)) => {
      setState((prev) => ({
        ...prev,
        sort: typeof newSorting === "function" ? newSorting(prev.sort) : newSorting,
        page: 1, // Reset to page 1 when sorting changes
      }));
    },
    [setState]
  );

  const setPagination = useCallback(
    (newPagination: PaginationState | ((prev: PaginationState) => PaginationState)) => {
      setState((prev) => {
        const updatedPagination =
          typeof newPagination === "function"
            ? newPagination({
                pageIndex: prev.page - 1,
                pageSize: prev.perPage,
              })
            : newPagination;
        return {
          ...prev,
          page: updatedPagination.pageIndex + 1,
          perPage: updatedPagination.pageSize,
        };
      });
    },
    [setState]
  );

  const setColumnVisibility = useCallback(
    (newVisibility: VisibilityState | ((prev: VisibilityState) => VisibilityState)) => {
      setState((prev) => ({
        ...prev,
        columns: typeof newVisibility === "function" ? newVisibility(prev.columns) : newVisibility,
      }));
    },
    [setState]
  );

  const resetState = useCallback(() => {
    setState({
      sort: [],
      page: 1,
      perPage: 10,
      columns: {},
    });
  }, [setState]);

  return {
    // State
    sorting,
    pagination,
    columnVisibility,

    // Setters
    setSorting,
    setPagination,
    setColumnVisibility,

    // Utilities
    resetState,

    // Raw state for advanced usage
    rawState: state,
  };
}
