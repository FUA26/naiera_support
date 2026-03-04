/**
 * Data Table Types
 *
 * Shared TypeScript types for advanced data table components
 */

import { ColumnDef } from "@tanstack/react-table";

/**
 * Sort direction for a column
 */
export type SortDirection = "asc" | "desc";

/**
 * Sort descriptor combining column and direction
 */
export interface SortDescriptor {
  id: string;
  direction: SortDirection;
}

/**
 * Filter value types
 */
export type FilterValue = string | string[] | Date | DateRange | undefined;

/**
 * Date range for date filters
 */
export interface DateRange {
  from?: Date;
  to?: Date;
}

/**
 * Filter descriptor
 */
export interface FilterDescriptor {
  id: string;
  value: FilterValue;
  operator?: "contains" | "equals" | "startsWith" | "endsWith" | "in" | "between";
}

/**
 * Table state managed in URL
 */
export interface TableState {
  sorting: SortDescriptor[];
  filters: Record<string, FilterValue>;
  page: number;
  perPage: number;
  columnVisibility: Record<string, boolean>;
}

/**
 * Props for data table components
 */
export interface DataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  searchPlaceholder?: string;
  searchableColumns?: string[];
}

/**
 * Props for data table toolbar
 */
export interface DataTableToolbarProps {
  table: any;
  searchPlaceholder?: string;
  searchableColumns?: string[];
  filterCount?: number;
  onClearFilters?: () => void;
}

/**
 * Props for column visibility toggle
 */
export interface DataTableColumnVisibilityProps {
  table: any;
}

/**
 * Props for data table pagination
 */
export interface DataTablePaginationProps {
  table: any;
  totalRows?: number;
}
