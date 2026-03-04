"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  SortingState,
  getSortedRowModel,
  ColumnFiltersState,
  getFilteredRowModel,
  getPaginationRowModel,
  VisibilityState,
  getFacetedRowModel,
  getFacetedUniqueValues,
  Table as TanStackTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

import { DataTablePagination } from "./data-table-pagination";

// Density types
export type DensityState = "short" | "medium" | "tall" | "extra-tall";

// Density height mapping
const densityHeights: Record<DensityState, string> = {
  short: "h-8",
  medium: "h-12",
  tall: "h-16",
  "extra-tall": "h-20",
};

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  toolbar?: (
    table: TanStackTable<TData>,
    density: DensityState,
    onDensityChange: (d: DensityState) => void
  ) => React.ReactNode;
  actionBar?: (table: TanStackTable<TData>) => React.ReactNode;
  enableRowSelection?: boolean;
  enablePagination?: boolean;
  defaultDensity?: DensityState;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  toolbar,
  actionBar,
  enableRowSelection = true,
  enablePagination = true,
  defaultDensity = "medium",
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: enablePagination
      ? getPaginationRowModel()
      : undefined,
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: enableRowSelection ? setRowSelection : undefined,
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection: enableRowSelection ? rowSelection : {},
    },
  });

  return (
    <DataTableContent
      table={table}
      columns={columns}
      toolbar={toolbar}
      actionBar={actionBar}
      enablePagination={enablePagination}
      defaultDensity={defaultDensity}
    />
  );
}

interface DataTableContentProps<TData, TValue> {
  table: TanStackTable<TData>;
  columns: ColumnDef<TData, TValue>[];
  toolbar?: (
    table: TanStackTable<TData>,
    density: DensityState,
    onDensityChange: (d: DensityState) => void
  ) => React.ReactNode;
  actionBar?: (table: TanStackTable<TData>) => React.ReactNode;
  enablePagination?: boolean;
  defaultDensity?: DensityState;
}

export function DataTableContent<TData, TValue>({
  table,
  columns,
  toolbar,
  actionBar,
  enablePagination = true,
  defaultDensity = "medium",
}: DataTableContentProps<TData, TValue>) {
  const [density, setDensity] = React.useState<DensityState>(defaultDensity);

  return (
    <div className="w-full space-y-4">
      {/* Toolbar */}
      {toolbar && toolbar(table, density, setDensity)}

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={cn(densityHeights[density])}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {enablePagination && <DataTablePagination table={table} />}

      {/* Action Bar (floating) */}
      {actionBar && actionBar(table)}
    </div>
  );
}

// Re-export types for external use
export type { TanStackTable as DataTableInstance };
